module.exports = function(grunt) {
    grunt.registerTask("reload", "reload Chrome on OS X",
        function() {
        require("child_process").exec("osascript " +
        "-e 'tell application \"Google Chrome\" " +
        "to tell the active tab of its first window' " +
        "-e 'reload' " +
        "-e 'end tell'");
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'assets/css',
                src: ['**/*'],
                dest: 'assets/css',
                ext: '.css'
            }
        },
        concat: {
            options: {
                separator: ''
            },
            dist: {
                src: ['assets/js/app.js'],
                dest: 'assets/js/compiled/app.js'
            }
        },
        imagemin: {
            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [
                    {
                        expand: true,
                        cwd: 'assets/img/',
                        src: ['**/*.png'],
                        dest: 'assets/img/',
                        ext: '.png'
                    }
                ]
            },
            jpg: {
                options: {
                    progressive: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'assets/img/',
                        src: ['**/*.jpg'],
                        dest: 'assets/img/',
                        ext: '.jpg'
                    }
                ]
            }
        },
        uglify: {
            dist: {
                options: {
                    compress: true,
                    report: 'gzip',
                    preserveComments: false,
                    mangle: true
                },
                files: {
                    'assets/js/app.min.js': ['assets/js/app.js']
                }
            }
        },
        sass: {
            dev: {
                files: {
                    'assets/css/styles.css' : 'assets/scss/*'
                },
                options: {
                    style: 'nested',
                    lineNumbers: true
                }
            },
            live: {
                files: {
                    'assets/css/styles.css' : 'assets/scss/*'
                },
                options: {
                    style: 'compressed',
                }
            }
        },
        watch: {
            css: {
                files: 'assets/**/*.scss',
                tasks: ['sass:dev', 'reload']
            },
            js: {
                files: 'assets/**/*.js',
                tasks: ['reload']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['watch']);
};