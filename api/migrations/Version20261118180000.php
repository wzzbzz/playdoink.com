<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261118180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add app_user.timezone: the player\'s timezone for "today" on the leaderboards (null = device)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "app_user" ADD timezone VARCHAR(64) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "app_user" DROP timezone');
    }
}
