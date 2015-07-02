module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + ' * Copyright (c) <%= grunt.template.today("yyyy") %>\n * Powered by <%= pkg.author.team%>' + '\n */\n',
		concat: {
            options: {

            },
            worker: {
                files: {
                    './src/dist/ftn.h5.alg-worker.js': [
                        './src/util/CommonUtil.js',
                        './src/modules/ConstDef.js',
                        './src/modules/DataDict.js',
                        './src/modules/algorithm/md5-spark.js',
                        './src/modules/algorithm/sha1-calculator.js',
                        './src/modules/algorithm/sha1-rusha.js',
                        './src/modules/worker/alg-main.js',
                        './src/modules/worker/upload-main.js'
                    ]
                }
            },
            main: {
                files: {
                    './src/dist/ftn.h5.main.js': [
                        './src/util/CommonUtil.js',
                        
                        './src/modules/base/namespace.js',
                        './src/modules/base/Emitter.js',
                        './src/modules/common/util.js',
                        
                        './src/modules/ConstDef.js',
                        './src/modules/DataDict.js',
                        
                        './src/modules/worker-adapter/workerAdapter.js',
                        './src/modules/upload/fileinfo.js',
                        './src/modules/upload/upload.xhr.js',
                        './src/modules/upload/upload.core.js',
                        './src/modules/upload/upload.main.js'
                    ]
                }
            }
        },
        uglify: {
            main : {
                files : [{
                    expand : true,
                    cwd : './src/dist',
                    src : ['**/*.js'],
                    dest : './src/dist'
                }]
            }
        },
		watch: {
		    app : {
		        files: ['<%= pkg.cfg.devPath%>/src/**/*.*'],
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
                    cwd: '<%= pkg.cfg.devPath %>/src/',
                    src: ['**/*.*'],
                    dest : '\\\\10.12.197.159\\users\\user_00\\ancheltong\\v.qq.com\\anchel\\test\\txftn\\',
                //    dest : '\\\\115.29.190.31\\web\\anchel.cn\\www\\demo\\txftn',
                    filter : 'isFile'
                }]
            }
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('dev', ['concat', 'copy:app']);
	grunt.registerTask('copyapp', ['concat', 'uglify', 'copy:app']);

    grunt.registerTask('default', ['copyapp']);
};