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
        // Store the new connection to send messages to later
        $this->clients->attach($conn);

        $clientCount = count($this->clients);
        $msg = '{"alias":"Admin","body":"A user has joined. Now ' . $clientCount . ' active users."}';
        foreach ($this->clients as $client) {
            if ($conn !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $numRecv = count($this->clients) - 1;

        foreach ($this->clients as $client) {
            if ($from !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);

        $clientCount = count($this->clients);
        $msg = '{"alias":"Admin","body":"A user has left. Now ' . $clientCount . ' active users."}';
        foreach ($this->clients as $client) {
            if ($conn !== $client) {
                // The sender is not the receiver, send to each client connected
                $client->send($msg);
            }
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $conn->close();
    }
}