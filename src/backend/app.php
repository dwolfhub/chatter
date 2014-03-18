<?php

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Chatter\Chatter;

require 'vendor/autoload.php';

$server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new Chatter()
            )
        ),
        8000
    );
$server->run();