module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %>\n * Powered by <%= pkg.author.team%>' + '\n */\n',
		
		watch: {
		    app : {
		        files: ['<%= pkg.cfg.devPath%>/app/**/*.*'],
                tasks: ['copyapp'],
                options: {
                    interval: 300
                }
		    }
		},
		copy: {
		    app : {
                files :[{
                    expand : true,
                    cwd: '<%= pkg.cfg.devPath %>/app/',
                    src: ['**/*.*'],
                    dest : '\\\\115.29.190.31\\web\\nodesite\\app',
                    filter : 'isFile'
                }]
            }
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('copyapp', ['copy:app']);  //部署web管理端文件到外网阿里云服务器

    grunt.registerTask('default', ['copyapp']);
};