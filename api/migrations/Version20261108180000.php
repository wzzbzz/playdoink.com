<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261108180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add app_user.api_token_hash: API token issued at login';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "app_user" ADD api_token_hash VARCHAR(64) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_APP_USER_API_TOKEN_HASH ON "app_user" (api_token_hash)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_APP_USER_API_TOKEN_HASH');
        $this->addSql('ALTER TABLE "app_user" DROP api_token_hash');
    }
}
