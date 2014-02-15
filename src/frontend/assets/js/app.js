try {
    if (!WebSocket) {
        console.log("no websocket support");
    } else {
        var socket = new WebSocket("ws://chatter.dev/api:80/");
        socket.addEventListener("open", function (e) {
            console.log("open: ", e);
        });
        socket.addEventListener("error", function (e) {
            console.log("error: ", e);
        });
        socket.addEventListener("message", function (e) {
            console.log("message: ", JSON.parse(e.data));
        });
        console.log("socket:", socket);
        window.socket = socket;
    }
} catch (e) {
    console.log("exception: " + e);
}

// var app = angular.module('chatter', [])
    // .factory('socket', function ($rootScope) {
    //     var socket = io.connect();
    //     return {
    //         on: function (eventName, callback) {
    //             socket.on(eventName, function () {
    //                 var args = arguments;
    //                 $rootScope.$apply(function () {
    //                     callback.apply(socket, args);
    //                 });
    //             });
    //         },
    //         emit: function (eventName, data, callback) {
    //             socket.emit(eventName, data, function () {
    //                 var args = arguments;
    //                 $rootScope.$apply(function () {
    //                     if (callback) {
    //                         callback.apply(socket, args);
    //                     }
    //                 });
    //             })
    //         }
    //     };
    // })
    // .controller('ChatterCtrl', ['$scope', function ($scope) {

    // }]);