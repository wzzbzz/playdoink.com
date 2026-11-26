<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;

/**
 * Works out who is calling the API from "Authorization: Bearer <apiToken>"
 * (the token is issued by /api/auth/verify-token and kept in the browser's doink_user).
 */
class ApiAuth
{
    /** @var string[] */
    private array $editorEmails;

    public function __construct(
        private UserRepository $users,
        #[Autowire('%env(default::GAME_EDITOR_EMAILS)%')] ?string $editorEmails = null,
    ) {
        $this->editorEmails = array_values(array_filter(array_map(
            fn ($e) => strtolower(trim($e)),
            explode(',', (string) $editorEmails)
        )));
    }

    public function user(Request $request): ?User
    {
        $header = (string) $request->headers->get('Authorization', '');
        if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', $header, $m)) {
            return null;
        }

        return $this->users->findOneBy(['apiTokenHash' => hash('sha256', strtolower($m[1]))]);
    }

    /** Editors may save game configs and make them live. Set GAME_EDITOR_EMAILS in .env.local. */
    public function isEditor(?User $user): bool
    {
        return $user !== null
            && $user->getEmail() !== null
            && in_array(strtolower($user->getEmail()), $this->editorEmails, true);
    }
}
