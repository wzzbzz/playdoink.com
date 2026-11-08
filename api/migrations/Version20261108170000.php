<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261108170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add game_config: saved rule sets for configurable games (Ultrado!nk config tool)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE game_config (id SERIAL NOT NULL, created_by_id INT DEFAULT NULL, game VARCHAR(32) NOT NULL, name VARCHAR(100) NOT NULL, rules JSON NOT NULL, is_live BOOLEAN DEFAULT false NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_GAME_CONFIG_CREATED_BY ON game_config (created_by_id)');
        $this->addSql('CREATE INDEX idx_game_config_game ON game_config (game)');
        $this->addSql('COMMENT ON COLUMN game_config.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN game_config.updated_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE game_config ADD CONSTRAINT FK_GAME_CONFIG_CREATED_BY FOREIGN KEY (created_by_id) REFERENCES "app_user" (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE game_config DROP CONSTRAINT FK_GAME_CONFIG_CREATED_BY');
        $this->addSql('DROP TABLE game_config');
    }
}
