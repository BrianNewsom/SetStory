module.exports = function(grunt){
	grunt.initConfig({
		compass:{
			dist: {                   // Target
		      options: {       
		      	outputStyle: 'expanded',       // Target options
		        sassDir: 'sass',
		        cssDir: 'css',
		        environment: 'production'
		      }
		    },
		    
		},
		watch: {
			files:['sass/**/*'],
			tasks:['compass']
		}
	});
	 // Load the plugin that provides the "uglify" task.
	  // Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['compass','watch']);
};