(function (angular) {
  "use strict";

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
    var socket = new ChatterWebSocket(),
    setAMessageProcessAndApply = function (alias, body) {
      var msg = {
        alias: alias,
        body: body
      };
      msgProcessor.setMessage(msg).processMessage();
      $scope.$apply();
    };

    socket.addEventListener('open', function (e) {
      setAMessageProcessAndApply('Admin', 'You are now connected!');
    });
    socket.addEventListener('error', function (e) {
      setAMessageProcessAndApply('Admin', 'An error has occurred!');
    });
    socket.addEventListener('close', function (e) {
      setAMessageProcessAndApply('Admin', 'You are now disconnected!');
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
  }

  var app = angular.module('chatter', [])
  .directive('focus', function() {
    return function(scope, element) {
      element[0].focus();
    };
  })
  .directive('fileDropzone', function() {
    return {
      restrict: 'A',
      scope: {
        file: '=',
        fileName: '='
      },
      link: function(scope, element, attrs) {
        var checkSize, isTypeValid, processDragOverOrEnter, validMimeTypes;
        processDragOverOrEnter = function(event) {
          if (event !== null) {
            event.preventDefault();
          }
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
        return element.bind('drop', function(event) {
          var file, name, reader, size, type;
          if (event !== null) {
            event.preventDefault();
          }
          reader = new FileReader();
          reader.onload = function(evt) {
            if (checkSize(size) && isTypeValid(type)) {
              return scope.$apply(function() {
                scope.file = evt.target.result;
                if (angular.isString(scope.fileName)) {
                  scope.fileName = name;
                  return scope.fileName;
                }
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
  .controller('ChatterCtrl', ['$scope', '$sce', function ($scope, $sce) {
    $scope.messages = [];
    $scope.message = {};
    $scope.userCount = 1;
    $scope.image = null;
    $scope.imageFileName = '';

    var msgProcessor = new IncomingMessageProcessor($scope, new UserMessageParser($sce), new Notification()),
    socket = new ChatterWebSocketSetup(msgProcessor, $scope);

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
})(angular);