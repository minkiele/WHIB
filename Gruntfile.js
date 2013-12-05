module.exports = function(grunt) {

  grunt.initConfig({
    less:{
      all:{
    	expand: true,
    	cwd: 'css/',
    	src: ['**/*.less'],
    	dest: 'css/',
    	ext: '.css'
      }
    },
    coffee:{
      all:{
    	expand: true,
    	cwd: 'js/',
    	src: ['**/*.coffee'],
    	dest: 'js/',
    	ext: '.js'
      }
    },
    watch:{
      less:{
        files: ['css/**/*.less'],
        tasks: ['less:all']
      },
      coffee:{
        files: ['js/**/*.coffee'],
        tasks: ['coffee:all']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['less:all', 'coffee:all']);

};