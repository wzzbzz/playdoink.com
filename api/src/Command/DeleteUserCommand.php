<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'deleteUser',
    description: 'Delete a User from the system',
)]
class DeleteUserCommand extends Command
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        parent::__construct();
        $this->userRepository = $userRepository;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('userId', InputArgument::REQUIRED, 'The ID of the user to delete')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $userId = $input->getArgument('userId');

        if ($userId) {
            $user = $this->userRepository->find($userId);
            if ($user) {
                if (!$io->confirm("Delete user: " . $user->getName() . "?", false)) {
                    $io->note('Deletion cancelled.');
                    return Command::SUCCESS;
                }
                //$this->userRepository->deleteUser($user);
                $io->success("User with ID $userId has been deleted.");
            } else {
                $io->error("User with ID $userId not found."); 
            }
        }

        $io->success('You have a new command! Now make it your own! Pass --help to see your options.');

        return Command::SUCCESS;
    }
}
