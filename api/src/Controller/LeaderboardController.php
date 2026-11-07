<?php

namespace App\Controller;

use App\Entity\Score;
use App\Repository\ScoreRepository;
use App\Repository\UserRepository;
use App\Service\EmailService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/leaderboard')]
class LeaderboardController extends AbstractController
{
    #[Route('/submit-score', methods: ['POST'])]
    public function submitScore(
        Request $request,
        UserRepository $userRepository,
        ScoreRepository $scoreRepository,
        EmailService $emailService,
        EntityManagerInterface $em
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        $userId = $data['userId'] ?? null;
        $scoreValue = $data['score'] ?? null;

        if (!$userId || !is_numeric($scoreValue)) {
            return new JsonResponse(['message' => 'Invalid data'], 400);
        }

        $user = $userRepository->find($userId);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }

        // Check leaderboard position BEFORE saving the score
        $leaderboardCheck = $scoreRepository->checkLeaderboardPosition((int) $scoreValue);

        $score = new Score();
        $score->setUser($user);
        $score->setScore((int) $scoreValue);
        $score->setCreatedAt(new \DateTimeImmutable());

        $em->persist($score);
        $em->flush();

        // Send dethroned emails if applicable
        if ($leaderboardCheck['isAllTimeFirst'] && $leaderboardCheck['dethronedAllTimeLeader']) {
            $dethroned = $leaderboardCheck['dethronedAllTimeLeader'];
            
            // Don't email if they beat their own record
            if ($dethroned['userId'] !== $userId && $dethroned['email']) {
                try {
                    $emailService->sendDethronedEmail(
                        $dethroned['email'],
                        $dethroned['username'] ?? 'Champion',
                        $dethroned['score'],
                        (int) $scoreValue,
                        $user->getUsername() ?? 'Anonymous',
                        'all-time'
                    );
                } catch (\Exception $e) {
                    // Log error but don't fail the request
                    error_log('Failed to send dethroned email: ' . $e->getMessage());
                }
            }
        }

        if ($leaderboardCheck['isDailyFirst'] && $leaderboardCheck['dethronedDailyLeader']) {
            $dethroned = $leaderboardCheck['dethronedDailyLeader'];
            
            // Don't email if they beat their own record or if same person as all-time
            $isDifferentPerson = $dethroned['userId'] !== $userId;
            $notAlreadyEmailed = !$leaderboardCheck['isAllTimeFirst'] || 
                                $dethroned['userId'] !== $leaderboardCheck['dethronedAllTimeLeader']['userId'];
            
            if ($isDifferentPerson && $notAlreadyEmailed && $dethroned['email']) {
                try {
                    $emailService->sendDethronedEmail(
                        $dethroned['email'],
                        $dethroned['username'] ?? 'Champion',
                        $dethroned['score'],
                        (int) $scoreValue,
                        $user->getUsername() ?? 'Anonymous',
                        'daily'
                    );
                } catch (\Exception $e) {
                    error_log('Failed to send dethroned email: ' . $e->getMessage());
                }
            }
        }

        return new JsonResponse([
            'message' => 'Score submitted',
            'score' => $scoreValue,
            'isDailyFirst' => $leaderboardCheck['isDailyFirst'],
            'isAllTimeFirst' => $leaderboardCheck['isAllTimeFirst']
        ], 200);
    }

    #[Route('/all-time', methods: ['GET'])]
    public function getAllTime(ScoreRepository $scoreRepository): JsonResponse
    {
        $leaderboard = $scoreRepository->getAllTimeLeaderboard(100);
        
        return new JsonResponse([
            'type' => 'all-time',
            'leaderboard' => $leaderboard
        ], 200);
    }

    #[Route('/daily', methods: ['GET'])]
    public function getDaily(ScoreRepository $scoreRepository): JsonResponse
    {
        $leaderboard = $scoreRepository->getDailyLeaderboard(100);
        
        return new JsonResponse([
            'type' => 'daily',
            'leaderboard' => $leaderboard
        ], 200);
    }

    #[Route('/my-stats/{userId}', methods: ['GET'])]
    public function getMyStats(
        int $userId,
        ScoreRepository $scoreRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $userRepository->find($userId);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }

        $bestScore = $scoreRepository->getUserBestScore($userId);
        $rank = $scoreRepository->getUserAllTimeRank($userId);
        $totalSelections = $user->getSelectionCount() ?? 0;

        // Calculate success percentage from selection history
        $successPercentage = 0;
        if ($totalSelections > 0) {
            $history = $user->getSelectionHistory();
            if ($history !== null) {
                if (is_resource($history)) {
                    $history = stream_get_contents($history);
                }
                
                $successCount = 0;
                $historyArray = array_values(unpack('C*', $history));
                
                // Each selection is 2 bits: bit1=top/bottom, bit2=success/fail
                // We only care about bit2 (success)
                for ($i = 0; $i < $totalSelections; $i++) {
                    $byteIndex = floor(($i * 2) / 8);
                    $bitPosition = ($i * 2) % 8;
                    
                    if (isset($historyArray[$byteIndex])) {
                        $byte = $historyArray[$byteIndex];
                        // Extract the success bit (second bit of the pair)
                        // Bits are stored as: [bit1, bit2, bit1, bit2, ...]
                        // Position 0-1 is first selection, 2-3 is second, etc.
                        $shiftAmount = 6 - $bitPosition;
                        if ($shiftAmount >= 0) {
                            $successBit = ($byte >> $shiftAmount) & 1;
                            if ($successBit) {
                                $successCount++;
                            }
                        }
                    }
                }
                
                $successPercentage = round(($successCount / $totalSelections) * 100, 1);
            }
        }

        // Get success rate rank
        $successRateRank = $userRepository->getSuccessRateRank($userId, $successPercentage);

        return new JsonResponse([
            'bestScore' => $bestScore,
            'allTimeRank' => $rank,
            'totalSelections' => $totalSelections,
            'successPercentage' => $successPercentage,
            'successRateRank' => $successRateRank
        ], 200);
    }
}
