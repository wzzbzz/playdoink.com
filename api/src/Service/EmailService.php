<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class EmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private UrlGeneratorInterface $urlGenerator
    ) {
    }

    /**
     * Send "You've been dethroned" email to previous leader
     */
    public function sendDethronedEmail(
        string $recipientEmail,
        string $recipientUsername,
        int $oldScore,
        int $newScore,
        string $newLeaderUsername,
        string $leaderboardType // 'daily' or 'all-time'
    ): void {
        $leaderboardLabel = $leaderboardType === 'daily' ? 'Daily' : 'All-Time';
        
        // Generate magic login link (we'll need to implement this)
        $magicLink = $this->generateMagicLink($recipientEmail);

        $email = (new Email())
            ->from('noreply@playdoink.com')
            ->to($recipientEmail)
            ->subject("👑 Your DO!NK {$leaderboardLabel} Record Has Fallen!")
            ->html($this->getDethronedEmailTemplate(
                $recipientUsername,
                $oldScore,
                $newScore,
                $newLeaderUsername,
                $leaderboardLabel,
                $magicLink
            ));

        $this->mailer->send($email);
    }

    /**
     * Generate magic login link for user
     */
    private function generateMagicLink(string $email): string
    {
        // Generate a secure token
        $token = bin2hex(random_bytes(32));
        
        // Store token in database with expiration (would need to implement this)
        // For now, return a placeholder URL
        
        return "https://playdoink.com/auth/magic?token={$token}";
    }

    /**
     * Email template for dethroned notification
     */
    private function getDethronedEmailTemplate(
        string $username,
        int $oldScore,
        int $newScore,
        string $newLeader,
        string $leaderboardType,
        string $magicLink
    ): string {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Luckiest Guy', cursive, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            font-size: 48px;
            color: #2b8bf6;
            margin-bottom: 20px;
        }
        .crown {
            font-size: 72px;
            margin-bottom: 20px;
        }
        .message {
            font-size: 18px;
            line-height: 1.6;
            color: #333;
            margin-bottom: 30px;
        }
        .score-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }
        .score-box .old-score {
            font-size: 24px;
            opacity: 0.8;
            text-decoration: line-through;
        }
        .score-box .new-score {
            font-size: 36px;
            font-weight: bold;
            margin-top: 10px;
        }
        .cta-button {
            display: inline-block;
            background: #62bf5e;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-size: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            color: #999;
            font-size: 14px;
            margin-top: 30px;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="crown">👑</div>
        <div class="header">Your Throne Has Been Challenged!</div>
        
        <div class="message">
            <p>Hey {$username},</p>
            
            <p><strong>{$newLeader}</strong> just scored <strong>{$newScore}</strong> and claimed the #{$leaderboardType} spot on DO!NK!</p>
            
            <div class="score-box">
                <div class="old-score">Your Record: {$oldScore}</div>
                <div class="new-score">New Record: {$newScore}</div>
            </div>
            
            <p>Time to reclaim your crown! 👑</p>
            
            <div style="text-align: center;">
                <a href="{$magicLink}" class="cta-button">PLAY NOW</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This link will log you in automatically and is valid for 24 hours.
            </p>
        </div>
        
        <div class="footer">
            <p>Keep DO!NK-ing!</p>
            <p style="margin-top: 10px;">
                <a href="https://playdoink.com" style="color: #2b8bf6;">playdoink.com</a>
            </p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
