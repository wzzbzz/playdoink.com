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

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    #[Route('/request-login', methods: ['POST'])]
    public function requestLogin(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return new JsonResponse(['message' => 'Invalid email address'], 400);
        }

        // Find or create user
        // Find or create user
        $user = $userRepository->findOneBy(['email' => $email]);
        
        if (!$user) {
            $user = new User();
            $user->setEmail($email);
            $user->setCreatedAt(new \DateTimeImmutable());
        }

        // Generate secure token
        $token = bin2hex(random_bytes(32));
        $expiresAt = new \DateTimeImmutable('+1 hour');
        
        $user->setLoginToken($token);
        $user->setLoginTokenExpiresAt($expiresAt);
        
        $em->persist($user);
        $em->flush();

        // Send magic link email
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:8080';
        $magicLink = $frontendUrl . '/verify.php?token=' . $token;
        
        $emailMessage = (new Email())
            ->from('doink@playdoink.com')
            ->to($email)
            ->subject('Your DO!NK Magic Link')
            ->html("
                <h2>Welcome to DO!NK!</h2>
                <p>Click the link below to login:</p>
                <p><a href=\"{$magicLink}\">Login to DO!NK</a></p>
                <p>This link expires in 1 hour.</p>
            ");

        $mailer->send($emailMessage);

        return new JsonResponse(['message' => 'Magic link sent!'], 200);
    }

    #[Route('/verify-token', methods: ['POST'])]
    public function verifyToken(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;

        if (!$token) {
            return new JsonResponse(['message' => 'Token required'], 400);
        }

        $user = $userRepository->findOneBy(['loginToken' => $token]);

        if (!$user) {
            return new JsonResponse(['message' => 'Invalid token'], 401);
        }

        // Check if token expired
        $now = new \DateTimeImmutable();
        if ($user->getLoginTokenExpiresAt() < $now) {
            return new JsonResponse(['message' => 'Token expired'], 401);
        }

        // Clear the token after successful use
        $user->setLoginToken(null);
        $user->setLoginTokenExpiresAt(null);
        $em->flush();

        return new JsonResponse([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
            ]
        ], 200);
    }

    #[Route('/save-selection', methods: ['POST'])]
    public function saveSelection(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $selection = $data['selection'] ?? null; // "top" or "bottom"
        $success = $data['success'] ?? null; // true or false

        if (!$userId || !$selection || !is_bool($success)) {
            return new JsonResponse(['message' => 'Invalid data'], 400);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }

        // Get existing history or create new
        $history = $user->getSelectionHistory();
        if ($history === null) {
            $history = '';
        } else {
            // Convert stream resource to string if needed
            if (is_resource($history)) {
                $history = stream_get_contents($history);
            }
        }

        // Encode new selection as 2 bits
        // 00 = Bottom Fail, 01 = Bottom Success, 10 = Top Fail, 11 = Top Success
        $bit1 = ($selection === 'top') ? 1 : 0;
        $bit2 = $success ? 1 : 0;
        $twoBits = ($bit1 << 1) | $bit2;

        // Append to history using bit manipulation
        $historyArray = array_values(unpack('C*', $history)); // Convert to byte array
        
        // Get current selection count
        $currentSelections = $user->getSelectionCount() ?? 0;
        
        // If we're at max (10,000 selections = 20,000 bits = 2,500 bytes), remove oldest
        if ($currentSelections >= 10000) {
            // Remove oldest 2 bits by shifting everything left
            $bitString = '';
            foreach ($historyArray as $byte) {
                $bitString .= str_pad(decbin($byte), 8, '0', STR_PAD_LEFT);
            }
            // Remove first 2 bits, add our new 2 bits at the end
            $bitString = substr($bitString, 2) . str_pad(decbin($twoBits), 2, '0', STR_PAD_LEFT);
            
            // Convert back to bytes
            $historyArray = [];
            for ($i = 0; $i < strlen($bitString); $i += 8) {
                $historyArray[] = bindec(substr($bitString, $i, 8));
            }
        } else {
            // Just append the new 2 bits
            $bitPosition = ($currentSelections * 2) % 8; // Position within the last byte
            
            if ($bitPosition == 0) {
                // Start a new byte
                $historyArray[] = $twoBits << 6; // Put 2 bits in top positions
            } else {
                // Add to existing byte
                $lastIndex = count($historyArray) - 1;
                $shift = 6 - $bitPosition;
                $historyArray[$lastIndex] |= ($twoBits << $shift);
            }
            
            $currentSelections++;
        }

        // Convert back to binary string
        $newHistory = pack('C*', ...$historyArray);
        $user->setSelectionHistory($newHistory);
        $user->setSelectionCount($currentSelections);
        
        $em->flush();

        return new JsonResponse([
            'message' => 'Selection saved',
            'totalSelections' => $currentSelections
        ], 200);
    }

    #[Route('/update-username', methods: ['POST'])]
    public function updateUsername(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $username = $data['username'] ?? null;

        if (!$userId || !$username) {
            return new JsonResponse(['message' => 'User ID and username required'], 400);
        }

        // Validate username (alphanumeric, 3-20 chars)
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            return new JsonResponse(['message' => 'Username must be 3-20 characters (letters, numbers, underscore only)'], 400);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }

        $user->setUsername($username);
        $em->flush();

        return new JsonResponse([
            'message' => 'Username updated',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'username' => $user->getUsername(),
            ]
        ], 200);
    }
}
