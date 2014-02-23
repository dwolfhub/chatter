(function (angular) {
  "use strict";

  var app = angular.module('chatter', [])
  .service('notification', function () {
    var executeInterval = function (_this) {
        var plural, newTitle = 'ChatterJS';

        if (document.hasFocus()) {
          _this.clearInterval();
        } else if (document.title === 'ChatterJS') {
          plural = (_this.msgCount > 1)? 's': '';
          newTitle = _this.msgCount + ' new message' + plural + '!';
        }

        document.title = newTitle;
    },
    createInterval = function (_this) {
      _this.interval = setInterval(function () {
        executeInterval(_this);
      }, 500);
    };

    this.msgCount = 0;
    this.interval = null;
    this.newMessage = function () {
      if (!document.hasFocus()) {
        var _this = this;
        _this.msgCount++;
        if (_this.interval === null) {
          createInterval(_this);
        }
      }
    };
    this.clearInterval = function () {
      this.msgCount = 0;
      clearInterval(this.interval);
      this.interval = null;
    };
  })
  .service('userMessageParser', ['$sce', function ($sce) {
    var body,
    convertLinks = function () {
      body = body.replace(/(https?:\/\/[^\s]+)/g, '<a target="_blank" href="$1">$1</a>');
    };

    this.parse = function (input) {
      body = input;
      convertLinks();
      return $sce.trustAsHtml(body);
    };
  }])
  .service('incomingMessageProcessor', ['userMessageParser', 'notification', function (userMessageParser, notification) {
    var msg, $scope;

    this.setScope = function (scope) {
      $scope = scope;
    };
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
        $scope.userCount = msg.body;
      } else {
        var now = new Date();
        msg.datetime = now.toUTCString();
        msg.body = userMessageParser.parse(msg.body);
        $scope.messages.unshift(msg);
        notification.newMessage();
      }
      return this;
    };
  }])
  .service('chatterWebSocket', function () {
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
  })
  .service('chatterWebSocketSetup', ['chatterWebSocket', 'incomingMessageProcessor', function (chatterWebSocket, incomingMessageProcessor) {
    this.init = function ($scope) {
      var setAMessageProcessAndApply = function (alias, body) {
        var msg = {
          alias: alias,
          body: body
        };
        incomingMessageProcessor.setMessage(msg).processMessage();
        $scope.$apply();
      };

      chatterWebSocket.addEventListener('open', function (e) {
        setAMessageProcessAndApply('Admin', 'You are now connected!');
      });
      chatterWebSocket.addEventListener('error', function (e) {
        setAMessageProcessAndApply('Admin', 'An error has occurred!');
      });
      chatterWebSocket.addEventListener('close', function (e) {
        setAMessageProcessAndApply('Admin', 'You are now disconnected!');
      });
      chatterWebSocket.addEventListener('message', function (e) {
        incomingMessageProcessor.setJsonMessage(e.data).processMessage();
        $scope.$apply();
      });

      return chatterWebSocket.connect();
    };
  }])
  .directive('focus', function() {
    return function(scope, element) {
      element[0].focus();
    };
  })
  .directive('fileDropzoneActivator', function () {
    return {
      link: function (scope, element, attrs) {
        element.bind('dragenter', function () {
          scope.showFileDrop = true;
          scope.$apply();
        });
      }
    };
  })
  .directive('fileDropzone', function() {
    return {
      link: function(scope, element, attrs) {
        var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;
        processDragOverOrEnter = function(event) {
          event.preventDefault();
          event.dataTransfer.effectAllowed = 'copy';
          return false;
        };
        validMimeTypes = attrs.fileDropzone;
        checkSize = function(size) {
          var _ref;
          if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
            return true;
          } else {
            alert("File must be smaller than " + attrs.maxFileSize + " MB");
            return false;
          }
        };
        isTypeValid = function(type) {
          if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
            return true;
          } else {
            alert("Invalid file type.  File must be one of following types " + validMimeTypes);
            return false;
          }
        };

        element.bind('dragover', processDragOverOrEnter);
        element.bind('dragenter', processDragOverOrEnter);
        element.bind('dragleave', function(event) {
          event.preventDefault();
          return scope.$apply(function () {
            scope.showFileDrop = false;
          });
        });

        return element.bind('drop', function(event) {
          event.preventDefault();

          var file, name, reader, size, type;
          reader = new FileReader();
          reader.onload = function(evt) {
            if (checkSize(size) && isTypeValid(type)) {
              return scope.$apply(function() {
                var currMsg = scope.message;
                scope.message.alias = scope.message.alias || 'Anonymous';
                scope.message.body = '<img src="' + evt.target.result + '" />';
                scope.sendMessage();
                scope.message = currMsg;
                scope.showFileDrop = false;
              });
            }
          };
          file = event.dataTransfer.files[0];
          name = file.name;
          type = file.type;
          size = file.size;
          reader.readAsDataURL(file);
          return false;
        });
      }
    };
  })
  .controller('ChatterCtrl', ['$scope', '$sce', 'incomingMessageProcessor', 'chatterWebSocketSetup', 'notification', function ($scope, $sce, incomingMessageProcessor, chatterWebSocketSetup, notification) {
    $scope.messages = [];
    $scope.message = {};
    $scope.userCount = 1;
    $scope.image = null;
    $scope.imageFileName = '';
    $scope.showFileDrop = false;
    $scope.sendingFiles = [];

    $scope.sendMessage = function () {
      var msg = $scope.message;
      socket.send(JSON.stringify(msg));
      $scope.message.body = null;
    };

    var socket = chatterWebSocketSetup.init($scope);
    incomingMessageProcessor.setScope($scope);

    (function () {
      var welcomeMessage = {
        alias: 'Admin',
        body: 'Welcome to ChatterJS!'
      };
      if (!WebSocket) {
        welcomeMessage += ' This site requires the WebSocket API, which your browser does not support. Sorry.';
      }
      incomingMessageProcessor.setMessage(welcomeMessage).processMessage();
    })();
  }]);
})(angular);