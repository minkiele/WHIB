module.exports = function(grunt) {

  grunt.initConfig({
    less: {
      allDev: {
        options: {
          sourceMap: true,
          sourceMapBasepath: 'css/'
        },
    	expand: true,
    	cwd: 'css/',
    	src: ['**/*.less'],
    	dest: 'css/',
    	ext: '.css'
      },
      allProd: {
    	expand: true,
    	cwd: 'css/',
    	src: ['**/*.less'],
    	dest: 'css/',
    	ext: '.css',
        options: {
          compress: true,
          cleancss: true
        }
      }
    },
    coffee: {
      allDev: {
    	expand: true,
    	cwd: 'js/',
    	src: ['**/*.coffee'],
    	dest: 'js/',
    	ext: '.js',
        options: {
          sourceMap: true,
          bare: true
        }
      },
      allProd: {
    	expand: true,
    	cwd: 'js/',
    	src: ['**/*.coffee'],
    	dest: 'js/',
    	ext: '.tmp.js',
        options: {
          bare: true
        }
      }
    },
    uglify: {
      allProd: {
    	expand: true,
    	cwd: 'js/',
    	src: ['**/*.tmp.js'],
    	dest: 'js/',
    	ext: '.js'
      }
    },
    clean: {
      allProd: {
        src: ['js/**/*.tmp.js']
      }
    },
    watch: {
      less: {
        files: ['css/**/*.less'],
        tasks: ['less:allDev']
      },
      coffee: {
        files: ['js/**/*.coffee'],
        tasks: ['coffee:allDev']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task(s).
  grunt.registerTask('default', ['less:allDev', 'coffee:allDev']);
  grunt.registerTask('prod', ['less:allProd', 'coffee:allProd', 'uglify:allProd', 'clean:allProd']);

};
