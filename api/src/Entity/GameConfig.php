<?php

namespace App\Entity;

use App\Repository\GameConfigRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

/**
 * A saved set of rules for a configurable game (e.g. Ultrado!nk), made with the config tool.
 * `rules` is the JSON the game reads; see frontend/js/games/ultradoink.config.json.
 */
#[ORM\Entity(repositoryClass: GameConfigRepository::class)]
#[ORM\Table(name: 'game_config')]
#[ORM\Index(name: 'idx_game_config_game', columns: ['game'])]
class GameConfig
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 32)]
    private ?string $game = null;

    #[ORM\Column(length: 100)]
    private ?string $name = null;

    #[ORM\Column(type: Types::JSON)]
    private array $rules = [];

    /** The live config is the one the public game plays (one per game). */
    #[ORM\Column(options: ['default' => false])]
    private bool $isLive = false;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $createdBy = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt = null;

    public function getId(): ?int { return $this->id; }

    public function getGame(): ?string { return $this->game; }
    public function setGame(string $game): static { $this->game = $game; return $this; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getRules(): array { return $this->rules; }
    public function setRules(array $rules): static { $this->rules = $rules; return $this; }

    public function isLive(): bool { return $this->isLive; }
    public function setIsLive(bool $live): static { $this->isLive = $live; return $this; }

    public function getCreatedBy(): ?User { return $this->createdBy; }
    public function setCreatedBy(?User $user): static { $this->createdBy = $user; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $at): static { $this->createdAt = $at; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(\DateTimeImmutable $at): static { $this->updatedAt = $at; return $this; }
}
