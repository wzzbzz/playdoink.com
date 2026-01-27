<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;


/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    //    /**
    //     * @return User[] Returns an array of User objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?User
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    public function deleteUser(User $user): void
    {
        $em = $this->getEntityManager();
        $em->remove($user);
        $em->flush();
    }

    /**
     * Get user's success rate rank among all users
     * @param int $userId
     * @param float $userSuccessRate
     * @return int|null Rank (1 = highest success rate) or null if no comparisons
     */
    public function getSuccessRateRank(int $userId, float $userSuccessRate): ?int
    {
        // Get all users with selection counts > 0
        $users = $this->createQueryBuilder('u')
            ->where('u.selectionCount > 0')
            ->getQuery()
            ->getResult();

        if (empty($users)) {
            return null;
        }

        $successRates = [];
        
        foreach ($users as $user) {
            $totalSelections = $user->getSelectionCount() ?? 0;
            if ($totalSelections === 0) {
                continue;
            }

            $history = $user->getSelectionHistory();
            if ($history === null) {
                continue;
            }

            if (is_resource($history)) {
                $history = stream_get_contents($history);
            }

            $successCount = 0;
            $historyArray = array_values(unpack('C*', $history));

            for ($i = 0; $i < $totalSelections; $i++) {
                $byteIndex = floor(($i * 2) / 8);
                $bitPosition = ($i * 2) % 8;

                if (isset($historyArray[$byteIndex])) {
                    $byte = $historyArray[$byteIndex];
                    $shiftAmount = 6 - $bitPosition;
                    if ($shiftAmount >= 0) {
                        $successBit = ($byte >> $shiftAmount) & 1;
                        if ($successBit) {
                            $successCount++;
                        }
                    }
                }
            }

            $successRate = ($successCount / $totalSelections) * 100;
            $successRates[] = [
                'userId' => $user->getId(),
                'rate' => $successRate
            ];
        }

        // Sort by success rate descending
        usort($successRates, function($a, $b) {
            return $b['rate'] <=> $a['rate'];
        });

        // Find user's rank
        foreach ($successRates as $index => $data) {
            if ($data['userId'] === $userId) {
                return $index + 1; // Rank is 1-based
            }
        }

        return null;
    }
}
