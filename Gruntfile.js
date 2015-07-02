module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({
        jshint: {
            files: [
                'Gruntfile.js',
                'src/_attachments/js/*.js'
            ]
        }
    });

    grunt.registerTask('default', [
        'jshint'
    ]);

};
