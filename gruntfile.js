module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        stylus: {
            compile: {
                options: {},
                files: {
                    'public/stylesheets/style.css': 'app/stylesheets/style.styl',
                    'public/stylesheets/pt-form.css': 'app/stylesheets/pt-form.styl',
                    'public/stylesheets/create-patient.css': 'app/stylesheets/create-patient.styl',
                    'public/stylesheets/rom-form.css': 'app/stylesheets/rom-form.styl',
                    'public/stylesheets/add-measure.css': 'app/stylesheets/add-measure.styl',
                    'public/stylesheets/patients.css': 'app/stylesheets/patients.styl',
                    'public/stylesheets/patient-status.css': 'app/stylesheets/patient-status.styl',
                    'public/stylesheets/exercise-set.css': 'app/stylesheets/exercise-set.styl',
                    'public/stylesheets/exercise-form.css': 'app/stylesheets/exercise-form.styl'
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
                tasks: ['stylus']
            },
            js: {
                files: ['gruntfile.js', 'app/js/*'],
                tasks: ['uglify']
            },
            html: {
                files: ['app/views/*'],
                tasks: []
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['stylus', 'uglify', 'watch']);
    grunt.registerTask('publish', ['stylus', 'uglify']);
};
