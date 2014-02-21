<?php

namespace Chatter;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Chatter implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $this->userCountChange();
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $numRecv = count($this->clients) - 1;

        foreach ($this->clients as $client) {
            $client->send($msg);
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        $this->userCountChange();
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $conn->close();
    }

    private function userCountChange()
    {
        $clientCount = count($this->clients);
        $msg = '{"type":"userCount","body":"' . $clientCount . '"}';

        foreach ($this->clients as $client) {
            $client->send($msg);
        }
    }
}