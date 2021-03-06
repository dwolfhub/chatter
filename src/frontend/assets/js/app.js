(function (angular) {
  'use strict';

  angular.module('chatter', ['angular-websocket'])
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

        // is this a pending image message?
        if ($scope.sendingFiles.length) {
          for (var a = $scope.sendingFiles.length - 1; a >= 0; a--) {
            if ($scope.sendingFiles[a] === msg.body) {
              $scope.sendingFiles.splice(a, 1);
            }
          }
        }

        msg.body = userMessageParser.parse(msg.body);
        $scope.messages.unshift(msg);
        notification.newMessage();
      }
      return this;
    };
  }])
  // .service('chatterWebSocket', function () {
  //   var socket,
  //   socketURL = 'ws://chatterjs.dev:8080/',
  //   listeners = [];

  //   this.addEventListener = function (event, callback) {
  //     listeners[event] = callback;
  //   };
  //   this.connect = function () {
  //     socket = new WebSocket(socketURL);
  //     for (var event in listeners) {
  //       socket.addEventListener(event, listeners[event]);
  //     }
  //     return this;
  //   };
  //   this.send = function (message) {
  //     socket.send(message);
  //   };
  // })
  // .service('chatterWebSocketSetup', ['chatterWebSocket', 'incomingMessageProcessor', function (chatterWebSocket, incomingMessageProcessor) {
  //   this.init = function ($scope) {
  //     var setAMessageProcessAndApply = function (alias, body) {
  //       var msg = {
  //         alias: alias,
  //         body: body
  //       };
  //       incomingMessageProcessor.setMessage(msg).processMessage();
  //       $scope.$apply();
  //     };

  //     chatterWebSocket.addEventListener('open', function () {
  //       setAMessageProcessAndApply('Admin', 'You are now connected!');
  //     });
  //     chatterWebSocket.addEventListener('error', function (e) {
  //       setAMessageProcessAndApply('Admin', 'An error has occurred!');
  //     });
  //     chatterWebSocket.addEventListener('close', function () {
  //       setAMessageProcessAndApply('Admin', 'You are now disconnected!');
  //     });
  //     chatterWebSocket.addEventListener('message', function (e) {
  //       incomingMessageProcessor.setJsonMessage(e.data).processMessage();
  //       $scope.$apply();
  //     });

  //     return chatterWebSocket.connect();
  //   };
  // }])
  .directive('fileDropzoneActivator', function () {
    return {
      link: function (scope, element) {
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
            (function (scope) {
              clearTimeout(scope.fileErrorMessageTimeout);
              scope.fileErrorMessageTimeout = setTimeout(function () {
                scope.$apply(function () {
                  scope.fileErrorMessage = null;
                });
              }, 5e3);
            })(scope);
            scope.$apply(function () {
              scope.fileErrorMessage = 'File too big. 5mb only.';
            });
            return false;
          }
        };
        isTypeValid = function(type) {
          if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
            return true;
          } else {
            (function (scope) {
              clearTimeout(scope.fileErrorMessageTimeout);
              scope.fileErrorMessageTimeout = setTimeout(function () {
                scope.$apply(function () {
                  scope.fileErrorMessage = null;
                });
              }, 5e3);
            })(scope);
            scope.$apply(function () {
              scope.fileErrorMessage = 'Only png, jpg, or gif allowed.';
            });
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

          var file = event.dataTransfer.files[0],
          // name = file.name,
          size = file.size,
          type = file.type,
          reader = new FileReader();

          reader.onload = function(evt) {
            if (checkSize(size) && isTypeValid(type)) {
              return scope.$apply(function() {
                var currMsg = scope.message;
                scope.message.alias = scope.message.alias || 'Anonymous';
                scope.message.body = '<img src="' + evt.target.result + '" />';
                scope.sendMessage();
                scope.message = currMsg;
                scope.sendingFiles.push('<img src="' + evt.target.result + '" />');
                scope.showFileDrop = false;
              });
            }
            return scope.$apply(function() {
              scope.showFileDrop = false;
            });
          };
          reader.readAsDataURL(file);
          return false;
        });
      }
    };
  })
  .controller('ChatterCtrl', ['$scope', '$sce', 'WebSocket', '$timeout', function ($scope, $sce, WebSocket, $timeout) {
    $scope.messages = [];
    $scope.message = {
      type: 'chat',
      alias: 'Anonymous'
    };
    $scope.userCount = 1;
    $scope.image = null;
    $scope.imageFileName = '';
    $scope.showFileDrop = false;
    $scope.sendingFiles = [];
    $scope.fileErrorMessage = null;
    $scope.fileErrorMessageTimeout = null;

    $scope.sendMessage = function () {
      var msg = $scope.message;
      socket.send(JSON.stringify(msg));
      $scope.message.body = null;
    };

    var socket = WebSocket.new('ws://192.168.56.103:8080');

    socket.onerror(function (param1, param2, param3) {
      console.log('error', param1, param2, param3);
    });

    socket.onopen(function (param1, param2, param3) {
      console.log('connected', param1, param2, param3);
    });

    (function () {
      var now = new Date(),
        welcomeMessage = {
          alias: 'Admin',
          body: 'Welcome to ChatterJS!'
        };
      welcomeMessage.datetime = now.toUTCString();

      if (!WebSocket) {
        welcomeMessage += ' This site requires the WebSocket API, which your browser does not support. Sorry.';
      }
      welcomeMessage.body = $sce.trustAsHtml(welcomeMessage.body);
      $scope.messages.push(welcomeMessage);
    })();
  }]);
})(angular);