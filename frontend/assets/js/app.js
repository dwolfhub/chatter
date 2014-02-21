function ChatterWebSocket() {
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
    };
    this.send = function (message) {
        socket.send(message);
    };
}

function IncomingMessageProcessor(scope, userMsgParser) {
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

        var msgProcessor = new IncomingMessageProcessor($scope, new UserMessageParser($sce));

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

        socket.connect();
    }]);