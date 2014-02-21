function ChatterWebSocket() {
    var socket,
    socketURL = 'ws://chatterjs.com:8080/',
    listeners = [];

    this.addEventListener = function (event, callback) {
        listeners[event] = callback;
    };
    this.connect = function () {
        socket = new WebSocket(socketURL);
        for (event in listeners) {
            socket.addEventListener(event, listeners[event]);
        }
    };
    this.send = function (message) {
        socket.send(message);
    };
}

function IncomingMessageProcessor (scope, userMsgParser) {
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
            console.log(msg);
            msg.body = userMsgParser.parse(msg.body);
            console.log(msg);
            scope.messages.unshift(msg);
            scope.$apply();
        }
        return this;
    }
}

function UserMessageParser ($sce) {
    var body,
        convertLinks = function () {
            body = body.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1">$1</a>');
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

        $scope.sendMessage = function () {
            socket.send(JSON.stringify($scope.message));
            $scope.showMessage($scope.message.alias, $scope.message.body);
            $scope.message.body = null;
        };

        $scope.showMessage = function (alias, message) {
            var now = new Date();
            var userMsgParser = new UserMessageParser($sce);

            $scope.messages.unshift({
                alias: name,
                body: userMsgParser.parse(message),
                datetime: now.toUTCString()
            });
        };

        var welcomeMessage = 'Welcome to ChatterJS!';
        if (!WebSocket) {
            welcomeMessage += ' This site requires the WebSocket API, which your browser does not support. Sorry.';
        }

        $scope.showMessage('Admin', welcomeMessage);

        var socket = new ChatterWebSocket();
        socket.addEventListener('open', function (e) {
            $scope.showMessage('Admin', 'You are now connected!');
            $scope.$apply();
        });
        socket.addEventListener('error', function (e) {
            $scope.showMessage('Admin', 'An error has occurred! Trying to reconnect.');
            $scope.$apply();
        });
        socket.addEventListener('close', function (e) {
            $scope.showMessage('Admin', 'You are now disconnected!');
            $scope.$apply();
        });
        socket.addEventListener('message', function (e) {
            var msgProcessor = new IncomingMessageProcessor($scope, new UserMessageParser($sce));
            msgProcessor.setJsonMessage(e.data).processMessage();
            $scope.$apply();
        });

        socket.connect();
    }]);