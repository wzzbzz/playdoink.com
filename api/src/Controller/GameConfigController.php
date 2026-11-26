<?php

namespace App\Controller;

use App\Entity\GameConfig;
use App\Repository\GameConfigRepository;
use App\Service\ApiAuth;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Saved game configs for the config tool (frontend/ultradoink-config.html).
 *   GET  /api/game-configs?game=ultradoink   list (newest first, without rules)
 *   GET  /api/game-configs/{id}              one config, with rules
 *   POST /api/game-configs                   create  {game, name, rules}
 *   PUT  /api/game-configs/{id}              update  {name?, rules?}
 *   GET  /api/game-configs/live?game=...     the live config (what the public game plays), 404 if none
 *   POST /api/game-configs/{id}/make-live    make this the live config for its game (unsets the others)
 *
 * Reading is open. Create, update and make-live need "Authorization: Bearer <apiToken>"
 * from a logged-in user whose email is in GAME_EDITOR_EMAILS.
 */
#[Route('/api/game-configs')]
class GameConfigController extends AbstractController
{
    private const GAMES = ['ultradoink'];
    private const MAX_RULES_BYTES = 20000;

    #[Route('', methods: ['GET'])]
    public function list(Request $request, GameConfigRepository $repo): JsonResponse
    {
        $game = $request->query->get('game', 'ultradoink');
        $configs = $repo->findBy(['game' => $game], ['updatedAt' => 'DESC'], 200);

        return new JsonResponse(array_map(fn (GameConfig $c) => $this->summary($c), $configs));
    }

    #[Route('/live', methods: ['GET'])]
    public function live(Request $request, GameConfigRepository $repo): JsonResponse
    {
        $c = $repo->findOneBy(['game' => $request->query->get('game', 'ultradoink'), 'isLive' => true]);
        if (!$c) {
            return new JsonResponse(['message' => 'No live config'], 404);
        }

        return new JsonResponse($this->summary($c) + ['rules' => $c->getRules()]);
    }

    #[Route('/{id}/make-live', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function makeLive(int $id, Request $request, ApiAuth $auth, GameConfigRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        if ($denied = $this->denyUnlessEditor($request, $auth)) {
            return $denied;
        }
        $c = $repo->find($id);
        if (!$c) {
            return new JsonResponse(['message' => 'Config not found'], 404);
        }
        foreach ($repo->findBy(['game' => $c->getGame(), 'isLive' => true]) as $other) {
            $other->setIsLive(false);
        }
        $c->setIsLive(true);
        $c->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return new JsonResponse($this->summary($c));
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function get(int $id, GameConfigRepository $repo): JsonResponse
    {
        $c = $repo->find($id);
        if (!$c) {
            return new JsonResponse(['message' => 'Config not found'], 404);
        }

        return new JsonResponse($this->summary($c) + ['rules' => $c->getRules()]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request, ApiAuth $auth, EntityManagerInterface $em): JsonResponse
    {
        if ($denied = $this->denyUnlessEditor($request, $auth)) {
            return $denied;
        }
        $data = json_decode($request->getContent(), true) ?? [];
        $game = $data['game'] ?? 'ultradoink';
        if (!in_array($game, self::GAMES, true)) {
            return new JsonResponse(['message' => 'Unknown game'], 400);
        }
        if ($error = $this->validate($data, true)) {
            return new JsonResponse(['message' => $error], 400);
        }

        $now = new \DateTimeImmutable();
        $c = (new GameConfig())
            ->setGame($game)
            ->setName(trim($data['name']))
            ->setRules($data['rules'])
            ->setCreatedAt($now)
            ->setUpdatedAt($now);
        $c->setCreatedBy($auth->user($request));

        $em->persist($c);
        $em->flush();

        return new JsonResponse($this->summary($c) + ['rules' => $c->getRules()], 201);
    }

    #[Route('/{id}', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request, ApiAuth $auth, GameConfigRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        if ($denied = $this->denyUnlessEditor($request, $auth)) {
            return $denied;
        }
        $c = $repo->find($id);
        if (!$c) {
            return new JsonResponse(['message' => 'Config not found'], 404);
        }
        $data = json_decode($request->getContent(), true) ?? [];
        if ($error = $this->validate($data, false)) {
            return new JsonResponse(['message' => $error], 400);
        }

        if (isset($data['name'])) {
            $c->setName(trim($data['name']));
        }
        if (isset($data['rules'])) {
            $c->setRules($data['rules']);
        }
        $c->setUpdatedAt(new \DateTimeImmutable());
        $em->flush();

        return new JsonResponse($this->summary($c) + ['rules' => $c->getRules()]);
    }

    private function denyUnlessEditor(Request $request, ApiAuth $auth): ?JsonResponse
    {
        $user = $auth->user($request);
        if (!$user) {
            return new JsonResponse(['message' => 'Please log in'], 401);
        }
        if (!$auth->isEditor($user)) {
            return new JsonResponse(['message' => 'Only game editors can do this'], 403);
        }

        return null;
    }

    private function validate(array $data, bool $creating): ?string
    {
        if ($creating || isset($data['name'])) {
            $name = trim((string) ($data['name'] ?? ''));
            if ($name === '' || mb_strlen($name) > 100) {
                return 'Name is required (up to 100 characters)';
            }
        }
        if ($creating || isset($data['rules'])) {
            $rules = $data['rules'] ?? null;
            if (!is_array($rules) || !isset($rules['grid'], $rules['clock'])) {
                return 'Rules must be a config object with at least grid and clock';
            }
            if (strlen(json_encode($rules)) > self::MAX_RULES_BYTES) {
                return 'Rules are too large';
            }
        }

        return null;
    }

    private function summary(GameConfig $c): array
    {
        return [
            'id' => $c->getId(),
            'game' => $c->getGame(),
            'name' => $c->getName(),
            'live' => $c->isLive(),
            'createdBy' => $c->getCreatedBy()?->getUsername(),
            'createdAt' => $c->getCreatedAt()?->format(\DATE_ATOM),
            'updatedAt' => $c->getUpdatedAt()?->format(\DATE_ATOM),
        ];
    }
}
