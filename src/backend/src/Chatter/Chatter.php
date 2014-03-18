<?php

namespace Chatter;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use SplObjectStorage;

class Chatter implements MessageComponentInterface {

    /**
     * Rooms container
     *
     * @var Array
     */
    protected $rooms;

    /**
     * Users container, for keeping track of what room they are in
     *
     * @var Array
     */
    protected $users;

    public function __construct() {
        $this->rooms = ['' => new SplObjectStorage];
        echo "STARTED";
    }

    /**
     * When connection is opened
     *
     * @param  ConnectionInterface $conn
     * @return Void
     */
    public function onOpen(ConnectionInterface $conn) {
        // $this->rooms['']->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    /**
     * When message is received
     *
     * @param  ConnectionInterface $from
     * @param  String              $msg
     * @return Void
     */
    public function onMessage(ConnectionInterface $from, $msg) {
        // Decode message
        $msgObj = json_decode($msg);

        if (isset($msgObj->type) === true and isset($msgObj->body) === true) {
            $this->processMessage($from, $msg, $msgObj);
        }
    }

    /**
     * When connection is closed
     *
     * @param  ConnectionInterface $conn
     * @return Void
     */
    public function onClose(ConnectionInterface $conn) {
        $this->rooms['']->attach($conn);
    }

    /**
     * When a connection error occurs
     *
     * @param  ConnectionInterface $conn
     * @param  Exception           $e
     * @return Void
     */
    public function onError(ConnectionInterface $conn, \Exception $e) {
        // TODO: Set up logging?
        $conn->close();
    }

    protected function processMessage($from, $msg, $msgObj)
    {
        if ($msgObj->type === 'roomChange') {
            $this->processRoomChange($from, $msg, $msgObj);
        } elseif ($msgObj->type === 'chat') {
            $this->processChat($msg, $msgObj);
        }
    }

    protected function processRoomChange($from, $msg, $msgObj)
    {
        // User is making a a room change
        if (isset($msgObj->room) === true) {
            if ($msgObj->body === 'enterRoom') {
                $this->processEnterRoom($from, $msg, $msgObj);
            } elseif ($msgObj->body === 'exitRoom') {
                $this->processExitRoom($from, $msg, $msgObj);
            }
        }
    }

    protected function processEnterRoom($msg, $msgObj, $from)
    {
        // User is entering a room
        if (isset($this->rooms[$msgObj->room]) === false) {
            // Create room if it doesn't exist
            $this->rooms[$msgObj->room] = new SplObjectStorage;
        }
        $this->rooms[$msgObj->room]->attach($from);
    }

    protected function processExitRoom($msg, $msgObj, $from)
    {
        // User is leaving a room
        $this->rooms[$msgObj->room]->detach($from);
        if ($this->rooms[$msgObj->room]->count() === 0) {
            // Room is empty, destroy room
            unset($this->rooms[$msgObj->room]);
        }
    }

    protected function processChat($msg, $msgObj)
    {
        // User is sending a message
        foreach ($this->clients as $client) {
            $this->processChatClient($msg, $msgObj, $client);
        }
    }

    protected function processChatClient($msg, $msgObj, $client)
    {
        if ($from === $client) {
            // This client is the sender, add isSender property
            $msgObj->isSender = true;
            $client->send(json_encode($msgObj));
            unset($msgObj->isSender);
        } else {
            $client->send($msg);
        }
    }
}