
var app = angular.module('chatter', [])
    .controller('ChatterCtrl', ['$scope', function ($scope) {
        $scope.messages = [];
        $scope.message = {};
        $scope.actives = 0;

        $scope.sendMessage = function () {
            window.socket.send(JSON.stringify($scope.message));
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

        var socket = new WebSocket('ws://chatterjs.com:8080/');

        socket.addEventListener('open', function (e) {
            $scope.showMessage('Admin', 'You are now connected!');
            $scope.$apply();
        });

        socket.addEventListener('error', function (e) {
            $scope.showMessage('Admin', 'An error has occurred!');
            $scope.$apply();
        });

        socket.addEventListener('close', function (e) {
            $scope.showMessage('Admin', 'You are now disconnected!');
            $scope.$apply();
        });

        socket.addEventListener('message', function (e) {
            var data = JSON.parse(e.data);
            $scope.showMessage(data.alias, data.body);
            $scope.$apply();
        });

        window.socket = socket;
    }]);