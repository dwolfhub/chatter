module.exports = function(grunt) {
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
                separator: ';'
            },
            dist: {
                src: ['assets/js/*.js'],
                dest: 'assets/app.js'
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
                files: '**/*.scss',
                tasks: ['sass:dev']
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