<?php

namespace dwolf555/Chatter;

use Evenement\EventEmitterInterface;
use Ratchet\ConnectionInterface;
use Ratcket\MessageComponentInterface;

interface UserInterface
{
	public function getSocket();
	public function getSocket(ConnectionInterface $socket);
	public function getId();
	public function setId($id);
	public function getName();
	public function setName($name);
}