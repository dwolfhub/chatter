<!doctype html>
<html>
    <head>
        <title>ChatterJS</title>
        <link href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
        <link href="//netdna.bootstrapcdn.com/bootswatch/3.1.0/superhero/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="assets/css/styles.css">
    </head>
    <body ng-app="chatter">
        <div class="container">
            <div class="row">
                <div class="col-md-6 col-md-offset-3">
                    <h1>ChatterJS</h1>
                    <form role="form" ng-controller="ChatterCtrl" novalidate>
                        <div class="form-group">
                            <textarea class="form-control" rows="1" placeholder="Enter message" ng-model="message"></textarea>
                        </div>
                    </form>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-md-offset-3 well chat-messages">
                    <dl>
                        <dt>dwolf555 <span class="text-muted">[2013-01-01 12:54:89]</span></dt>
                        <dd>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, cumque repudiandae voluptatibus illo perferendis earum nostrum nesciunt ex tempora. Dolores, mollitia blanditiis eveniet commodi nam dolor vitae explicabo eos incidunt!</dd>
                        <dt>dwolf555 <span class="text-muted">[2013-01-01 12:54:89]</span></dt>
                        <dd>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, cumque repudiandae voluptatibus illo perferendis earum nostrum nesciunt ex tempora. Dolores, mollitia blanditiis eveniet commodi nam dolor vitae explicabo eos incidunt!</dd>
                        <dt>dwolf555 <span class="text-muted">[2013-01-01 12:54:89]</span></dt>
                        <dd>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, cumque repudiandae voluptatibus illo perferendis earum nostrum nesciunt ex tempora. Dolores, mollitia blanditiis eveniet commodi nam dolor vitae explicabo eos incidunt!</dd>
                        <dt>dwolf555 <span class="text-muted">[2013-01-01 12:54:89]</span></dt>
                        <dd>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, cumque repudiandae voluptatibus illo perferendis earum nostrum nesciunt ex tempora. Dolores, mollitia blanditiis eveniet commodi nam dolor vitae explicabo eos incidunt!</dd>
                        <dt>dwolf555 <span class="text-muted">[2013-01-01 12:54:89]</span></dt>
                        <dd>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, cumque repudiandae voluptatibus illo perferendis earum nostrum nesciunt ex tempora. Dolores, mollitia blanditiis eveniet commodi nam dolor vitae explicabo eos incidunt!</dd>
                    </dl>
                </div>
            </div>
        </div>
        <!-- // <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.2.12/angular.min.js"></script> -->
        <script src="assets/js/app.js"></script>
    </body>
</html>