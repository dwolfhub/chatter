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
        foreach ($this->clients as $client) {
            if ($from === $client) {
                $oldMsg = $msg;
                $msg = json_decode($msg);
                $msg->isSender = true;
                $msg = json_encode($msg);
                $client->send($msg);
                $msg = $oldMsg;
            } else {
                $client->send($msg);
            }
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