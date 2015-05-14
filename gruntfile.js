module.exports = function(grunt) {

	grunt.initConfig({
			
		sass: {
		    dist: {
		      files: {
		        'css/styleall.css': 'sass/styleall.scss'
		      }
		    }
		  }

	});

	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.registerTask('default', ['sass']);

}