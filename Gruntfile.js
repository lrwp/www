module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-mkdir');

    grunt.initConfig({
        jshint: {
            files: [
                'Gruntfile.js',
                'src/_attachments/js/*.js'
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
        }
    });

    grunt.registerTask('default', [
        'clean:build',
        'mkdir',
        'copy',
        'clean:nodejs', // tmp hack until src is restructured
        'uglify',
        'jshint'
    ]);

};
