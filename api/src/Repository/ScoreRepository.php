<?php

namespace App\Repository;

use App\Entity\Score;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ScoreRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Score::class);
    }

    /**
     * Get all-time leaderboard
     */
    public function getAllTimeLeaderboard(int $limit = 100): array
    {
        $rows = $this->createQueryBuilder('s')
            ->select('s.score', 'u.username', 'u.email', 's.createdAt')
            ->join('s.user', 'u')
            ->orderBy('s.score', 'DESC')
            ->addOrderBy('s.createdAt', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return $this->publicRows($rows);
    }

    /**
     * Get daily leaderboard (today's scores only)
     */
    public function getDailyLeaderboard(int $limit = 100): array
    {
        
        $tz = new \DateTimeZone('America/New_York');
        $today = (new \DateTimeImmutable('now', $tz))->setTime(0, 0, 0);
        
        $tomorrow = $today->modify('+1 day');

        $rows = $this->createQueryBuilder('s')
            ->select('s.score', 'u.username', 'u.email', 's.createdAt')
            ->join('s.user', 'u')
            ->where('s.createdAt >= :today')
            ->andWhere('s.createdAt < :tomorrow')
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->orderBy('s.score', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return $this->publicRows($rows);
    }

    /**
     * Get user's best score ever
     */
    public function getUserBestScore(int $userId): ?int
    {
        $result = $this->createQueryBuilder('s')
            ->select('MAX(s.score) as bestScore')
            ->where('s.user = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult();

        return $result['bestScore'] ?? null;
    }

    /**
     * Get user's rank in all-time leaderboard
     */
    public function getUserAllTimeRank(int $userId): ?int
    {
        $bestScore = $this->getUserBestScore($userId);
        
        if ($bestScore === null) {
            return null;
        }

        $result = $this->createQueryBuilder('s')
            ->select('COUNT(DISTINCT s2.score) + 1 as rank')
            ->from(Score::class, 's2')
            ->where('s2.score > :bestScore')
            ->setParameter('bestScore', $bestScore)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }

    /**
     * Check if a score is #1 on daily or all-time leaderboard
     * Returns info about previous leaders if dethroned
     */
    public function checkLeaderboardPosition(int $score): array
    {
        $result = [
            'isDailyFirst' => false,
            'isAllTimeFirst' => false,
            'dethronedDailyLeader' => null,
            'dethronedAllTimeLeader' => null
        ];

        // Check all-time #1 and get previous leader
        $allTimeTop = $this->createQueryBuilder('s')
            ->select('s.score as topScore', 'u.id as userId', 'u.email', 'u.username')
            ->join('s.user', 'u')
            ->orderBy('s.score', 'DESC')
            ->addOrderBy('s.createdAt', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($allTimeTop && $score > $allTimeTop['topScore']) {
            $result['isAllTimeFirst'] = true;
            $result['dethronedAllTimeLeader'] = [
                'userId' => $allTimeTop['userId'],
                'email' => $allTimeTop['email'],
                'username' => $allTimeTop['username'],
                'score' => $allTimeTop['topScore']
            ];
        }

        // Check daily #1 and get previous leader
        $tz = new \DateTimeZone('America/New_York');
        $today = (new \DateTimeImmutable('now', $tz))->setTime(0, 0, 0);
        $tomorrow = $today->modify('+1 day');

        $dailyTop = $this->createQueryBuilder('s')
            ->select('s.score as topScore', 'u.id as userId', 'u.email', 'u.username')
            ->join('s.user', 'u')
            ->where('s.createdAt >= :today')
            ->andWhere('s.createdAt < :tomorrow')
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->orderBy('s.score', 'DESC')
            ->addOrderBy('s.createdAt', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if ($dailyTop && $score > $dailyTop['topScore']) {
            $result['isDailyFirst'] = true;
            $result['dethronedDailyLeader'] = [
                'userId' => $dailyTop['userId'],
                'email' => $dailyTop['email'],
                'username' => $dailyTop['username'],
                'score' => $dailyTop['topScore']
            ];
        }

        return $result;
    }

    /**
     * Leaderboards are public: never send email addresses to clients.
     * Players without a username keep the name the page already showed
     * (the part of their email before the @).
     */
    private function publicRows(array $rows): array
    {
        return array_map(function (array $row) {
            if (empty($row['username'])) {
                $row['username'] = strstr((string) ($row['email'] ?? ''), '@', true) ?: 'Anonymous';
            }
            unset($row['email']);
            return $row;
        }, $rows);
    }
}
