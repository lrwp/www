module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.initConfig({
        jshint: {
            files: [
                'Gruntfile.js'
            ]
        }
    });

    grunt.registerTask('default', [
        'jshint'
    ]);

};
