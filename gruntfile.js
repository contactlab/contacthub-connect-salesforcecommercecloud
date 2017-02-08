'use strict';

let parseXML = require('node-xml-lite').parseFileSync;
let servicesConf = parseXML('import/site-import/services.xml');

module.exports = function(grunt) {
    let demandwareCredentials = JSON.parse(grunt.file.read('no-sync/demandware.json'));

    grunt.initConfig({
        generateServiceConf: {
            services: servicesConf.childs
        },
        concat: {
            options: {
                separator: "\n\n"
            },
            dist: {
                src: ['scripts-templates/serviceInit.tpl.ds', 'generated*.js'],
                dest: 'cartridge/scripts/init/contactLabHubServiceInit.ds',
            },
        },
        clean: {
            intermediate: ['generated*.js', './**/.DS_Store']
        },
        'webdav_sync': {
            'default': {
                options: {
                    local_path: './cartridge/**/*',
                    remote_path: demandwareCredentials.url.replace('username@password',
                        demandwareCredentials.username + '@' + demandwareCredentials.password
                    ),
                    sendImmediately: true,
                    strictSSL: false
                }
            }
        },
        compress: {
        	main: {
        		options: {
        			archive: 'import/site-import.zip'
        		},
        		files: [
        			{expand: true, cwd: 'import/site-import/', src: ['**'], dest: '/site-import/'}
        		]
        	}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-webdav-sync');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.task.registerMultiTask('generateServiceConf', 'Generate the service init from the service xml', function() {
        this.data.forEach(function(line, index) {
            if (typeof line === 'object' && line.hasOwnProperty('name') && line.name === 'service') {
                let template = grunt.file.read('scripts-templates/serviceConf.tpl.ds');
                let result = grunt.template.process(template, {
                    data: {
                        'serviceName': line.attrib['service-id']
                    },
                    delimiters: 'config'
                });
                grunt.file.write('generated' + ("0000" + index).slice(-4) + '.js', result);
            }
        });
    });

    /*
    grunt.task.registerTask('demandware-sync', function() {
    	let demandwareCredentials = JSON.parse(grunt.file.read('no-sync/demandware.json'));
    	var options = {
    		    local_base: ".",
    		    remote_base: demandwareCredentials.url,
    		    username: demandwareCredentials.username,
    		    password: demandwareCredentials.password,
    		    ignored: ".git,.svn,.DS_Store,node_modules,scripts-templates,no-sync"
    		};
    		var sync = (require('webdav-sync'))(options);
    		sync.start();
    });
    */

    grunt.registerTask('default', [
        'generateServiceConf',
        'concat',
        'clean',
        'compress',
        'webdav_sync'
    ]);
};
