<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20261109160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add score.game (which game the score is from); existing scores are Classic';
    }

    public function up(Schema $schema): void
    {
        // The default fills in existing rows, so every score so far becomes 'classic'.
        $this->addSql("ALTER TABLE score ADD game VARCHAR(20) DEFAULT 'classic' NOT NULL");
        $this->addSql('CREATE INDEX idx_score_game_score ON score (game, score)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX idx_score_game_score');
        $this->addSql('ALTER TABLE score DROP game');
    }
}
