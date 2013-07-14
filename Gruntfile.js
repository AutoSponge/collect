module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        //pkg: grunt.file.readJSON('package.json'),
        jshint: {
            ignore_warning: {
                options: {
                    '-W061': true
                },
                src: ['src/collect.js']
            },
            all: ['Gruntfile.js', 'src-test/**/*.js']
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        },
        qunit: {
            all: ['src-test/**/*.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // A convenient task alias.
    grunt.registerTask('default', ['jshint', 'qunit']);

};