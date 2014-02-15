<?php

namespace dwolf555\Chatter;

use Evenement\EventEmitterInterface;
use Ratchet\ConnectionInterface;
use Ratchet\MessageComponentInterface;

interface ChatterInterface extends MesssageComponentInterface
{
	public function getUserBySocket(ConnectionInterface $socket);
	public function getEmitter();
	public function setEmitter(EventEmitterInterface $emitter);
	public function getUsers();
}