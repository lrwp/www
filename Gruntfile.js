module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            files: [
                'Gruntfile.js',
                'src/_attachments/js/*.js'
            ]
        },
        jsonlint: {
            files: [
                'package.json',
                'src/schema/*.json'
            ]
        },
        mkdir: {
            build: {
                options: {
                    create: ['build']
                }
            }
        },
        clean: {
            build: ['build'],
            nodejs: ['build/src/nodejs'],
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**'],
                        dest: 'build/src'
                    }
                ]
            }
        },
        uglify: {
             build: {
                 options: {
                     report: 'min'
                 },
                 files: [
                     {
                         expand: true,
                         cwd: 'build/src',
                         src: [
                             '_attachments/js/**.js',
                             '!_attachments/js/**.min.js'
                         ],
                         dest: 'build/src'
                     }
                 ]
             }
        },
        cssmin: {
            build: {
                 options: {
                     report: "min",
                     keepSpecialComments: 0
                 },
                 files: [
                     {
                         expand: true,
                         cwd: "build/src/_attachments",
                         src: [

                             "css/**.css",
                             "!css/**.min.css",
                         ],
                         dest: "build/src/_attachments"
                     }
                 ]
             }
        },
        'couch-compile': {
            build: {
                files: {
                     'build/www.json': 'build/src'
                }
            }
        }
    });

    grunt.registerTask('default', [
        'jshint',
        'jsonlint',
        'clean:build',
        'mkdir',
        'copy',
        'clean:nodejs', // tmp hack until src is restructured
        'uglify',
        'cssmin',
        'couch-compile'
    ]);

};
