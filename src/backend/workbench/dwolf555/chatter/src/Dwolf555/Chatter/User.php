<?php

namespace dwolf555\Chatter;

use Ratchet\ConnectionInterface;

class User implements UserInterface
{
	protected $socket;
	protected $id;
	protected $name;

	public function getSocket()
	{
		return $this->socket;
	}

	public function setSocket(ConnectionInterface $socket)
	{
		$this->socket = $socket;
		return $this;
	}

	public function getId()
	{
		return $this->id;
	}

	public function setId($id)
	{
		$this->id = $id;
		return $this;
	}

	public function getName()
	{
		return $this->name;
	}

	public function setName($name)
	{
		$this->name = $name;
		return $this;
	}
}