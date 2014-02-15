<?php

namespace dwolf555\Chatter\Command;

use Illuminate\Console\Command;
use Formativ\Chat\ChatterInterface;
use Formativ\Chat\UserInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class Serve extends Command
{
    protected $name = 'chatter:serve';
    protected $description = 'Serve chatter sockets.';
    protected $chatter;

    public function getUserName(UserInterface $user)
    {
        $suffix = ' (' . $user->getId() . ')';

        if ($name = $user->getName()) {
            return $name . $suffix;
        }

        return 'User' . $suffix;
    }

    public function __construct(ChatterInterface $chatter)
    {
        parent::__construct();

        $this->chatter = $chatter;

        $open = function (UserInterface $user)
        {
            $name = $this->getUserName($user);
            $this->line('
                <info>' . $name . ' connected.</info>
            ');
        };

        $this->chatter->getEmitter()->on('open', $open);

        $close = function (UserInterface $user)
        {
            $name = $this->getUserName($user);
            $this->line('
                <info>' . $name . ' disconnected.</info>
            ');
        };

        $this->chatter->getEmitter()->on('close', $close);

        $message = function (UserInterface $user, $message)
        {
            $name = $this->getUserName($user);
            $this->line('
                <info>New message from ' . $name . '</info>
                <comment>' . $message . '</comment>
                <info>.</info>
            ');
        };

        $this->chatter->getEmitter()->on('message', $message);

        $name = function (UserInterface $user, $message)
        {
            $this->line("
                <info>User changed their name to:</info>
                <comment>" . $message . "</comment>
                <info>.</info>
            ");
        };

        $this->chatter->getEmitter()->on('name', $name);

        $error = function (UserInterface $user, $exception)
        {
            $message = $exception->getMessage();

            $this->line('
                <info>User encountered an exception:</info>
                <comment>' . $message . '</comment>
                <info>.</info>
            ');
        };

        $this->chatter->getEmitter()->on('name', $name);
    }

    public function fire()
    {
        $port = (int) $this->option('port');

        if (!$port) {
            $port = 7778;
        }

        $server = IoServer::factory(
            new HttpServer(
                new WebServer(
                    $this->chatter
                )
            ),
            $port
        );

        $this->line('
            <info>Listening on port</info>
            <comment>' . $port . '</comment>
            <info>.</info>
        ');

        $server->run();
    }

    public function getOptions()
    {
        return [
            [
                'port',
                null,
                InputOption::VALUE_REQUIRED,
                'Port to listen on.',
                null
            ]
        ];
    }
}