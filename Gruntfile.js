module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-mkdir');
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
        },
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['*', '!nodejs'],
                        dest: 'build/src'
                    }
                ]
            }
        },
    });

    grunt.registerTask('default', [
        'clean',
        'mkdir',
        'copy',
        'jshint'
    ]);

};
