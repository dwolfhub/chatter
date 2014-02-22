
"use strict"

function ChatterWebSocket () {
    var socket,
    socketURL = 'ws://chatterjs.com:8080/',
    listeners = [];

    this.addEventListener = function (event, callback) {
        listeners[event] = callback;
    };
    this.connect = function () {
        socket = new WebSocket(socketURL);
        for (var event in listeners) {
            socket.addEventListener(event, listeners[event]);
        }
        return this;
    };
    this.send = function (message) {
        socket.send(message);
    };
}

function ChatterWebSocketSetup (msgProcessor, $scope) {
    var socket = new ChatterWebSocket();
    socket.addEventListener('open', function (e) {
        var msg = {
            alias: 'Admin',
            body: 'You are now connected!'
        };
        msgProcessor.setMessage(msg).processMessage();
        $scope.$apply();
    });
    socket.addEventListener('error', function (e) {
        var msg = {
            alias: 'Admin',
            body: 'An error has occurred! Trying to reconnect.'
        };
        msgProcessor.setMessage(msg).processMessage();
        $scope.$apply();
    });
    socket.addEventListener('close', function (e) {
        var msg = {
            alias: 'Admin',
            body: 'You are now disconnected!'
        };
        msgProcessor.setMessage(msg).processMessage();
        $scope.$apply();
    });
    socket.addEventListener('message', function (e) {
        msgProcessor.setJsonMessage(e.data).processMessage();
        $scope.$apply();
    });

    return socket.connect();
}

function IncomingMessageProcessor (scope, userMsgParser, notification) {
    var msg;

    this.setJsonMessage = function (txtMessage) {
        msg = JSON.parse(txtMessage);
        return this;
    };
    this.setMessage = function (message) {
        msg = message;
        return this;
    };
    this.processMessage = function () {
        if (msg.type === 'userCount') {
            scope.userCount = msg.body;
        } else {
            var now = new Date();
            msg.datetime = now.toUTCString();
            msg.body = userMsgParser.parse(msg.body);
            scope.messages.unshift(msg);
            notification.newMessage();
        }
        return this;
    };
}

function UserMessageParser ($sce) {
    var body,
        convertLinks = function () {
            body = body.replace(/(https?:\/\/[^\s]+)/g, '<a target="_blank" href="$1">$1</a>');
        };

    this.parse = function (input) {
        body = input;
        convertLinks();
        return $sce.trustAsHtml(body);
    };
}

function Notification () {
    this.msgCount = 0;
    this.interval = null;

    this.newMessage = function () {
        if (!document.hasFocus()) {
            var _this = this;
            this.msgCount++;
            if (this.interval === null) {
                this.interval = setInterval(function () {
                    var plural = (_this.msgCount > 1)? 's': '', newTitle;
                    if (document.title === 'ChatterJS') {
                        newTitle = _this.msgCount + ' new message' + plural + '!'
                    } else {
                        newTitle = 'ChatterJS';
                    }
                    document.title = newTitle;
                    if (document.hasFocus()) {
                        _this.clearInterval();
                    }
                }, 500);
            }
        }
    };

    this.clearInterval = function () {
        this.msgCount = 0;
        clearInterval(this.interval);
        this.interval = null;
    }
}

var app = angular.module('chatter', [])
    .directive('focus', function() {
        return function(scope, element) {
            element[0].focus();
        };
    })
    .controller('ChatterCtrl', ['$scope', '$sce', function ($scope, $sce) {
        $scope.messages = [];
        $scope.message = {};
        $scope.userCount = 1;

        var msgProcessor = new IncomingMessageProcessor($scope, new UserMessageParser($sce), new Notification()),
            socket = ChatterWebSocketSetup(msgProcessor, $scope);

        $scope.sendMessage = function () {
            var msg = $scope.message;
            socket.send(JSON.stringify(msg));
            $scope.message.body = null;
        };

        (function () {
            var welcomeMessage = {
                alias: 'Admin',
                body: 'Welcome to ChatterJS!'
            };
            if (!WebSocket) {
                welcomeMessage += ' This site requires the WebSocket API, which your browser does not support. Sorry.';
            }
            msgProcessor.setMessage(welcomeMessage).processMessage();
        })();
    }]);