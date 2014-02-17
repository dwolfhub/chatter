function ChatterWebSocket() {
    this.socketURL = 'ws://chatterjs.com:8080/';
    this.listeners = [];
    this.addEventListener = function (event, callback) {
        this.listeners[event] = callback;
    };
    this.connect = function () {
        this.socket = new WebSocket(this.socketURL);
        for (event in this.listeners) {
            this.socket.addEventListener(event, this.listeners[event]);
        }
    };
    this.send = function (message) {
        this.socket.send(message);
    }
}

var app = angular.module('chatter', [])
    .directive('focus', function() {
        return function(scope, element) {
            element[0].focus()
        }
    })
    .controller('ChatterCtrl', ['$scope', function ($scope) {
        $scope.messages = [];
        $scope.message = {};
        $scope.actives = 0;

        $scope.sendMessage = function () {
            socket.send(JSON.stringify($scope.message));
            $scope.showMessage($scope.message.alias, $scope.message.body);
            $scope.message.body = null;
        }

        $scope.showMessage = function (name, message) {
            var now = new Date();
            $scope.messages.unshift({
                name: name,
                body: message,
                datetime: now.toUTCString()
            });
        }

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
            // socket.connect();
        });
        socket.addEventListener('close', function (e) {
            $scope.showMessage('Admin', 'You are now disconnected!');
            $scope.$apply();
            // socket.connect();
        });
        socket.addEventListener('message', function (e) {
            var data = JSON.parse(e.data);
            $scope.showMessage(data.alias, data.body);
            $scope.$apply();
        });
        socket.connect();
    }]);