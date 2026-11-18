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
    public function getAllTimeLeaderboard(int $limit = 100, string $game = Score::DEFAULT_GAME): array
    {
        $rows = $this->createQueryBuilder('s')
            ->select('s.score', 'u.username', 'u.email', 's.createdAt')
            ->join('s.user', 'u')
            ->where('s.game = :game')
            ->setParameter('game', $game)
            ->orderBy('s.score', 'DESC')
            ->addOrderBy('s.createdAt', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        return $this->publicRows($rows);
    }

    /** Timezone used for "today" when the viewer's isn't given or isn't a real IANA zone. */
    public const DEFAULT_DAY_TZ = 'America/New_York';

    /** True for a real IANA timezone name (DateTimeZone::listIdentifiers()), e.g. "Europe/London". */
    public static function isTimezone(mixed $tz): bool
    {
        return is_string($tz) && in_array($tz, \DateTimeZone::listIdentifiers(), true);
    }

    /** The viewer's IANA timezone (e.g. "Europe/London") if valid, else America/New_York. */
    public static function dayTimezone(mixed $tz): string
    {
        return self::isTimezone($tz) ? $tz : self::DEFAULT_DAY_TZ;
    }

    /**
     * "Today" for the leaderboards is the viewer's local calendar day (it resets at their midnight);
     * $tz is their IANA timezone, validated by dayTimezone() (default America/New_York).
     * Returns [start, end) of that day, converted to the timezone score.created_at is stored in:
     * the column is TIMESTAMP WITHOUT TIME ZONE and scores are stamped with new \DateTimeImmutable(),
     * i.e. PHP's default timezone (UTC on the server). Before 2026-11-18 the New York wall-clock
     * midnight was compared to UTC times as if it were UTC, so scores after 7 PM ET (8 PM in summer)
     * fell into "tomorrow". DST is handled by PHP: a New York day can be 23 or 25 hours long.
     *
     * @return array{0: \DateTimeImmutable, 1: \DateTimeImmutable}
     */
    public static function dayBoundsUtc(?string $tz = null, ?\DateTimeImmutable $now = null): array
    {
        $local = new \DateTimeZone(self::dayTimezone($tz));
        $stored = new \DateTimeZone(date_default_timezone_get());
        $start = ($now ?? new \DateTimeImmutable('now'))->setTimezone($local)->setTime(0, 0, 0);
        $end = $start->modify('+1 day');   // next local midnight (23/25h across DST changes)
        return [$start->setTimezone($stored), $end->setTimezone($stored)];
    }

    /**
     * Get daily leaderboard (today's scores only)
     */
    public function getDailyLeaderboard(int $limit = 100, string $game = Score::DEFAULT_GAME, ?string $tz = null): array
    {
        [$today, $tomorrow] = self::dayBoundsUtc($tz);

        $rows = $this->createQueryBuilder('s')
            ->select('s.score', 'u.username', 'u.email', 's.createdAt')
            ->join('s.user', 'u')
            ->where('s.createdAt >= :today')
            ->andWhere('s.createdAt < :tomorrow')
            ->andWhere('s.game = :game')
            ->setParameter('game', $game)
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
    public function getUserBestScore(int $userId, string $game = Score::DEFAULT_GAME): ?int
    {
        $result = $this->createQueryBuilder('s')
            ->select('MAX(s.score) as bestScore')
            ->where('s.user = :userId')
            ->andWhere('s.game = :game')
            ->setParameter('userId', $userId)
            ->setParameter('game', $game)
            ->getQuery()
            ->getOneOrNullResult();

        return $result['bestScore'] ?? null;
    }

    /**
     * Get user's rank in all-time leaderboard
     */
    public function getUserAllTimeRank(int $userId, string $game = Score::DEFAULT_GAME): ?int
    {
        $bestScore = $this->getUserBestScore($userId, $game);
        
        if ($bestScore === null) {
            return null;
        }

        $result = $this->createQueryBuilder('s')
            ->select('COUNT(DISTINCT s2.score) + 1 as rank')
            ->from(Score::class, 's2')
            ->where('s2.score > :bestScore')
            ->andWhere('s2.game = :game')
            ->setParameter('bestScore', $bestScore)
            ->setParameter('game', $game)
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result;
    }

    /**
     * Check if a score is #1 on daily or all-time leaderboard
     * Returns info about previous leaders if dethroned
     */
    public function checkLeaderboardPosition(int $score, string $game = Score::DEFAULT_GAME, ?string $tz = null): array
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
            ->where('s.game = :game')
            ->setParameter('game', $game)
            ->orderBy('s.score', 'DESC')
            ->addOrderBy('s.createdAt', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        // Games other than Classic: the first score on an empty board is #1 too (Classic unchanged).
        $emptyIsFirst = $game !== Score::DEFAULT_GAME && $score > 0;

        if (!$allTimeTop && $emptyIsFirst) {
            $result['isAllTimeFirst'] = true;
        }
        if ($allTimeTop && $score > $allTimeTop['topScore']) {
            $result['isAllTimeFirst'] = true;
            $result['dethronedAllTimeLeader'] = [
                'userId' => $allTimeTop['userId'],
                'email' => $allTimeTop['email'],
                'username' => $allTimeTop['username'],
                'score' => $allTimeTop['topScore']
            ];
        }

        // Check daily #1 (in the player's local day) and get previous leader
        [$today, $tomorrow] = self::dayBoundsUtc($tz);

        $dailyTop = $this->createQueryBuilder('s')
            ->select('s.score as topScore', 'u.id as userId', 'u.email', 'u.username')
            ->join('s.user', 'u')
            ->where('s.createdAt >= :today')
            ->andWhere('s.createdAt < :tomorrow')
            ->andWhere('s.game = :game')
            ->setParameter('game', $game)
            ->setParameter('today', $today)
            ->setParameter('tomorrow', $tomorrow)
            ->orderBy('s.score', 'DESC')
            ->addOrderBy('s.createdAt', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$dailyTop && $emptyIsFirst) {
            $result['isDailyFirst'] = true;
        }
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
