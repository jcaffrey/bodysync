module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        stylus: {
            compile: {
                options: {},
                files: {
                    'public/stylesheets/style.css': 'app/stylesheets/style.styl',
                    'public/stylesheets/pt-form.css': 'app/stylesheets/pt-form.styl',
                    'public/stylesheets/rom-form.css': 'app/stylesheets/rom-form.styl',
                    'public/stylesheets/add-measure.css': 'app/stylesheets/add-measure.styl',
                    'public/stylesheets/patients.css': 'app/stylesheets/patients.styl'
                }
            }
        },

        uglify: {
            minify: {
                options: {
                    reserveDOMProperties: true,
                },
                files: [{
                    expand: true,
                    cwd: 'app/js',
                    src: '**/*.js',
                    dest: 'public/js',
                    ext: '.min.js'
                }]
            }
        },

        watch: {
            css: {
                files: ['gruntfile.js', 'app/stylesheets/*'],
                tasks: ['stylus'],
                options: { livereload: 10000 }
            },
            js: {
                files: ['gruntfile.js', 'app/js/*'],
                tasks: ['uglify'],
                options: { livereload: 10000 }
            },
            html: {
                files: ['app/views/*'],
                tasks: [],
                options: { livereload: 10000 }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['stylus', 'uglify', 'watch']);
    grunt.registerTask('publish', ['stylus', 'uglify']);
};
