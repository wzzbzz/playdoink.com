<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

// Sign-up from the playdoink.com home page.
// Uses the same users as Doink! login, but sends a welcome email instead of a login link.
#[Route('/api/signup')]
class SignupController extends AbstractController
{
    #[Route('', methods: ['POST'])]
    public function signup(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = strtolower(trim($data['email'] ?? ''));

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => 'Please enter a valid email address.'], 400);
        }

        // Already signed up: no second welcome email
        $user = $userRepository->findOneBy(['email' => $email]);
        if ($user && $user->getSignedUpAt()) {
            return new JsonResponse(['message' => "You're already signed up.", 'status' => 'already'], 200);
        }

        // A Doink! player who hasn't signed up yet keeps their account
        if (!$user) {
            $user = new User();
            $user->setEmail($email);
            $user->setCreatedAt(new \DateTimeImmutable());
            $em->persist($user);
        }
        $user->setSignedUpAt(new \DateTimeImmutable());
        $em->flush();

        $emailMessage = (new Email())
            ->from('doink@playdoink.com')
            ->to($email)
            ->subject('Thanks for signing up to Playdoink.com')
            ->html("
                <h2>Thanks for signing up!</h2>
                <p>This is going to be fun.</p>
                <p>We'll let you know when there's something new to play. In the meantime:</p>
                <ul>
                    <li><a href=\"https://quadruplex.playdoink.com\">Quadruplex</a>: bust your brain on this word game with a twist.</li>
                    <li><a href=\"https://duckduckgoose.playdoink.com\">Duck, Duck, Goose</a>: crack all eight ducks without hitting the goose.</li>
                    <li><a href=\"https://doink.playdoink.com\">Doink!</a>: the world's hardest simplest game.</li>
                </ul>
                <p><a href=\"https://playdoink.com\">Playdoink.com</a></p>
            ");

        $mailer->send($emailMessage);

        return new JsonResponse(['message' => "Thanks for signing up! Check your email.", 'status' => 'new'], 200);
    }

    // Is this email signed up? Used by the home page to decide whether to show the form.
    #[Route('/status', methods: ['GET'])]
    public function status(Request $request, UserRepository $userRepository): JsonResponse
    {
        $email = strtolower(trim((string) $request->query->get('email', '')));

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => 'Please enter a valid email address.'], 400);
        }

        $user = $userRepository->findOneBy(['email' => $email]);

        return new JsonResponse(['signedUp' => $user !== null && $user->getSignedUpAt() !== null], 200);
    }
}
