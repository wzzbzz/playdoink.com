<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261020203000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add app_user.signed_up_at (home page sign-up); existing users count as signed up';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "app_user" ADD signed_up_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN "app_user".signed_up_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('UPDATE "app_user" SET signed_up_at = created_at');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "app_user" DROP signed_up_at');
    }
}
