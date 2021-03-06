module.exports = function ( grunt ) {

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('assemble');

    var userConfig = require( './build.config.js' );

    var taskConfig = {
        pkg: grunt.file.readJSON("package.json"),
        filename: '<%= pkg.name %>-<%= pkg.version %>',

        meta: {
            banner:
            '/**\n' +
                ' * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * <%= pkg.homepage %>\n' +
                ' *\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
                ' * Dual-licensed under the MIT and GPL-2.0 licenses.\n' +
                ' */\n'
        },

        bump: {
            options: {
                files: [
                    "package.json",
                    "bower.json"
                ],
                commit: true,
                commitMessage: 'release v%VERSION%',
                commitFiles: [
                    "package.json",
                    "bower.json"
                ],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin'
            }
        },

        clean: {
            build: [
            '<%= build_dir %>'
            ],
            compile: [
            '<%= compile_dir %>'
            ],
            docs: [
            '<%= build_dir %>/docs'
            ],
        },

        copy: {
            build_i18n: {
                files: [
                    {
                        src: [ '<%= app_files.i18n %>' ],
                        dest: '<%= build_dir %>/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            build_vendorjs: {
                files: [
                    {
                        src: [ '**/*.js' ],
                        dest: '<%= build_dir %>/vendor',
                        cwd: 'bower_components/jquery/dist/',
                        expand: true
                    }
                ]
            },
            compile_appjs: {
                files: [
                    {
                        src: [ '<%= filename %>.js' ],
                        dest: '<%= compile_dir %>/',
                        cwd: '<%= build_dir %>/',
                        expand: true
                    }
                ]
            },
            compile_vendorjs: {
                files: [
                    {
                        src: [ '**/*.js' ],
                        dest: '<%= compile_dir %>/vendor',
                        cwd: 'bower_components/jquery/dist/',
                        expand: true
                    }
                ]
            },
            build_external: {
                files: [
                    {
                        src: [ '<%= app_files.external %>' ],
                        dest: '<%= build_dir %>/src/',
                        cwd: '.',
                        expand: true
                    }
                ]
            },
            doc_assets: {
                files: [
                    {
                        src: [ '*.js' ],
                        dest: '<%= build_dir %>/docs',
                        cwd: 'docs/template/',
                        expand: true
                    },
                    {
                        src: [ '*.*' ],
                        dest: '<%= build_dir %>/docs/demos/data',
                        cwd: 'docs/content/demos/data/',
                        expand: true
                    }

                ]
            },
            doc_vendor_assets: {
                files: [
                    {
                        src: [ '**/*' ],
                        dest: '<%= build_dir %>/docs/bootstrap',
                        cwd: 'bower_components/bootstrap/dist/',
                        expand: true
                    },
                    {
                        src: [ 'vendor/**/*' ],
                        dest: '<%= build_dir %>/docs',
                        cwd: '<%= build_dir %>/',
                        expand: true
                    },
                    {
                        src: [ 'i18n/grid.locale-en.js' ],
                        dest: '<%= build_dir %>/docs',
                        cwd: '<%= build_dir %>/',
                        expand: true
                    },
                    {
                        src: [ '*.*' ],
                        dest: '<%= build_dir %>/docs',
                        cwd: '<%= build_dir %>/',
                        expand: true
                    }
                ]
            }
        },

        concat: {
            compile_css: {
                src: [
                    '<%= vendor_files.css %>',
                    '<%= build_dir %>/<%= filename %>.css'
                ],
                dest: '<%= compile_dir %>/<%= filename %>.min.css'
            },
            compile_js: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                src: [
                    '<%= app_files.js %>',
                    '<%= app_files.external %>'
                ],
                dest: '<%= build_dir %>/<%= filename %>.js'
            }
        },

        uglify: {
            compile: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: {
                    '<%= compile_dir %>/<%= filename %>.min.js': '<%= concat.compile_js.dest %>'
                }
            },
            compile_i18n: {
                options: {
                    banner: '<%= meta.banner %>'
                },
                files: [{
                    expand: true,
                    cwd: '<%= build_dir %>/i18n/',
                    src: '*.js',
                    dest: '<%= compile_dir %>/i18n',
                    rename: function(dest, src)
                    {
                        return dest + '/' + src.replace(/js$/, 'min.js');
                    }
                }]
            }
        },

        less: {
            build: {
                files: {
                    '<%= build_dir %>/<%= filename %>.css': '<%= app_files.less %>'
                }
            },
            compile: {
                files: {
                    '<%= build_dir %>/<%= filename %>.css': '<%= app_files.less %>'
                },
                options: {
                    cleancss: true,
                    compress: true
                }
            },
            build_docs: {
                files: {
                    '<%= build_dir %>/docs/docs.css': '<%= doc_files.less %>'
                }
            }
        },

        jshint: {
            src: [
                '<%= app_files.js %>'
            ],
            test: [
                '<%= app_files.jsunit %>'
            ],
            gruntfile: [
                'Gruntfile.js'
            ],
            options: {
                curly: true,
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true
            },
            globals: {}
        },

        karmaconfig: {
            unit: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= app_files.jsunit %>'
                ]
            }
        },

        karma: {
            options: {
                configFile: '<%= build_dir %>/karma-unit.js'
            },
            unit: {
                port: 9019,
                background: true
            },
            continuous: {
                singleRun: true,
                background: true
            }
        },

        delta: {
            options: {
                livereload: true
            },

            gruntfile: {
                files: 'Gruntfile.js',
                tasks: [ 'jshint:gruntfile' ],
                options: {
                    livereload: false
                }
            },

            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                tasks: [ 'jshint:src', 'karma:unit:run', 'copy:build_i18n' ]
            },

            less: {
                files: [ 'less/*.less' ],
                tasks: [ 'less:build' ]
            },

            jsunit: {
                files: [
                    '<%= app_files.jsunit %>'
                ],
                tasks: [ 'jshint:test', 'karma:unit:run' ],
                options: {
                    livereload: false
                }
            },

            docs: {
                files: [
                    '<%= doc_files.contentdir %>/<%= doc_files.content %>',
                    '<%= doc_files.template %>',
                    '<%= doc_files.helpers %>',
                    '<%= doc_files.less %>',
                    '<%= doc_files.js %>'
                ],
                tasks: [ 'assemble', 'less:build_docs', 'copy:doc_assets' ]
            }
        },
        assemble: {
            options: {
                layoutdir: '<%= doc_files.layoutdir %>',
                layout: '<%= doc_files.layout %>',
                partials: '<%= doc_files.partials %>',
                assets: '<%= build_dir %>/docs',
                data: 'package.json',
                helpers: ['<%= doc_files.helpers %>']
            },
            overview: {
                options: {
                    layout: 'overview.hbs'
                },
                src: ['*.md'],
                dest: '<%= build_dir %>/docs/',
                cwd: '<%= doc_files.contentdir %>/',
                expand: true
            },
            subpage: {
                options: {
                    layout: 'subpage.hbs'
                },
                src: ['configuration/*.md'],
                dest: '<%= build_dir %>/docs/',
                cwd: '<%= doc_files.contentdir %>/',
                expand: true
            },
            demos: {
                options: {
                    layout: 'demos.hbs',
                    data: ['package.json', '<%= doc_files.datadir %>/demos.json'],
                },
                src: ['demos/*.md'],
                dest: '<%= build_dir %>/docs/',
                cwd: '<%= doc_files.contentdir %>/',
                expand: true
            }
        },
        'gh-pages': {
            options: {
                base: 'build/docs'
            },
            src: ['**']
        },

    };

    grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

    grunt.renameTask( 'watch', 'delta' );
    grunt.registerTask( 'watch', [ 'build', 'karma:unit', 'docs', 'delta' ] );

    grunt.registerTask( 'default', [ 'build', 'compile' ] );

    grunt.registerTask( 'build', [
        'clean:build', 'jshint', 'less:build',
        'copy:build_i18n', 'copy:build_external', 'copy:build_vendorjs', 'concat:compile_js',
        'karmaconfig', 'karma:continuous'
    ]);

    grunt.registerTask( 'compile', [
        'clean:compile', 'less:compile', 'concat:compile_css', 'copy:compile_appjs', 'copy:compile_vendorjs', 'uglify:compile', 'uglify:compile_i18n'
    ]);

    grunt.registerTask( 'docs', [
        'clean:docs', 'assemble', 'copy:doc_vendor_assets', 'copy:doc_assets', 'less:build_docs'
    ]);

    function filterForJS ( files ) {
        return files.filter( function ( file ) {
            return file.match( /\.js$/ );
        });
    }

    grunt.registerMultiTask( 'karmaconfig', 'Process karma config templates', function () {
        var jsFiles = filterForJS( this.filesSrc );
        grunt.file.copy( 'karma/karma-unit.tpl.js', grunt.config( 'build_dir' ) + '/karma-unit.js', {
            process: function ( contents, path ) {
                return grunt.template.process( contents, {
                    data: {
                        scripts: jsFiles
                    }
                });
            }
        });
    });
};
