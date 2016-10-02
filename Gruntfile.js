module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.config.init({
    npm: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        esversion: 6
      },
      files: [
        'Gruntfile.js',
        'src/_attachments/js/*.js'
      ]
    },
    jsonlint: {
      src: {
        files: {
          src: [
            '.jscsrc',
            'package.json',
            '.couchrc.example.json',
            'src/schema/*.json'
          ]
        }
      },
      ddoc: {
        files: {
          src: [
            'build/www.json'
          ]
        }
      }
    },
    jscs: {
      src: [
        'Gruntfile.js'
      ],
      options: {
        config: '.jscsrc',
        fix: false
      }
    },
    mkdir: {
      build: {
        options: {
          create: [
            'build',
            'build/config/vhosts',
            'build/replication'
          ]
        }
      }
    },
    clean: {
      build: [
        'build'
      ],
      nodejs: [
        'build/src/nodejs'
      ],
      config: [
        'build/config'
      ]
    },
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: [
              '**'
            ],
            dest: 'build/src'
          }
        ]
      }
    },
    uglify: {
      build: {
        options: {
          report: 'min'
        },
        files: [
          {
            expand: true,
            cwd: 'build/src',
            src: [
              '_attachments/js/**.js',
              '!_attachments/js/**.min.js'
            ],
            dest: 'build/src'
          }
        ]
      }
    },
    cssmin: {
      build: {
        options: {
          report: 'min',
          keepSpecialComments: 0
        },
        files: [
          {
            expand: true,
            cwd: 'build/src/_attachments',
            src: [
              'css/**.css',
              '!css/**.min.css'
            ],
            dest: 'build/src/_attachments'
          }
        ]
      }
    },
    'couch-compile': {
      build: {
        files: {
          'build/www.json': 'build/src'
        }
      }
    }
  });

  grunt.registerTask('couchrc', 'Load couchrc', function(path) {
    var rc, location = path || process.env.COUCHRC || '.couchrc';
    try {
      rc = grunt.file.readJSON(location);
    } catch (e) {
      location = '.couchrc.example.json';
      grunt.log.error(`Copy ${location} to .couchrc or export COUCHRC`);
      throw e;
    }
    console.log(`Using ${location}`);
    grunt.config('couch-push', rc);
    grunt.config('couch-configure', rc);
    grunt.config('couch-replication', rc);
  });

  grunt.registerTask('couch-triton', 'Provision on Triton', function() {
    var
      done = this.async(),
      url = require('url'),
      triton = require('triton'),
      bunyan = require('bunyan'),
      request = require('request'),
      npm = grunt.config.get('npm'),
      auth = require('smartdc-auth'),
      rc = grunt.config.get('couch-push'),
      config = grunt.config('couch-configure'),
      replication = grunt.config('couch-replication'),
      vhost = url.parse(npm.homepage).hostname,
      api = {
        triton: triton.createClient({profileName: 'env'}),
        cloud: triton.createCloudApiClient({
          url: process.env.TRITON_URL || process.env.SDC_URL,
          account: process.env.TRITON_ACCOUNT || process.env.SDC_ACCOUNT,
          log: bunyan.createLogger({name: 'api'}),
          sign: auth.cliSigner({
            keyId: process.env.TRITON_KEY_ID || process.env.SDC_KEY_ID,
            user: process.env.TRITON_ACCOUNT || process.env.SDC_ACCOUNT,
            log: bunyan.createLogger({name: 'sign'})
          })
        })
      },
      machine = {
        'metadata.couchdb_bind_address': '0.0.0.0',
        'metadata.couchdb_password': rc.options.pass,
        'metadata.user-script': grunt.file.read('user-script.sh'),
        name: npm.name,
        tags: {
          role: 'couchdb'
        }
      },
      attempts = null,
      retry = function (url, callback) {
        attempts += 1;
        request
          .get(url)
          .on('error', function(error) {
            if (attempts <= 30) {
              grunt.log.write('.');
              setTimeout(function () {
                retry(url, callback);
              }, 500);
            } else {
              callback(error);
            }
          })
          .on('response', function () {
            callback();
          });
      };
    api.triton.listImages(function (error, imgs) {
      api.triton.close();
      imgs.forEach(function (img) {
        if (img.name === 'couchdb') {
          machine.image = img.id;
        }
      });
      grunt.log.ok(`Data Center: ${api.cloud.url}`);
      grunt.log.ok(`Image: ${machine.image}`);
      api.cloud.listPackages(function (error, pkgs) {
        pkgs.forEach(function (pkg) {
          if (pkg.memory <= 1024) {
            machine.package = pkg.id;
          }
        });
        grunt.log.ok(`Package: ${machine.package}`);
        api.cloud.createMachine(machine, function (error, machine) {
          machine.states = ['running'];
          grunt.log.ok(`Waiting for instance: ${machine.id}`);
          (function twiddle() {
            if (attempts === null) {
              grunt.log.write('.');
              setTimeout(function () {
                twiddle();
              }, 3500);
            }
          })();
          api.cloud.waitForMachineStates(machine, function (error, instance) {
            var url = `http://${instance.primaryIp}:5984`;
            attemps = 0;
            grunt.log.writeln();
            grunt.log.ok(`Waiting for endpoint: ${url}`);
            rc.triton.files[`${url}/${instance.name}`] = 'build/www.json';
            grunt.config('couch-push', rc);
            retry(url, function (e) {
              grunt.log.writeln();
              config.triton.files[url] = 'build/config';
              grunt.config('couch-configure', config);
              grunt.file.write(`build/config/vhosts/${vhost}`,
                `${instance.name}/_design/www/_rewrite`);
              instance.dns_names.forEach(function (fqdn) {
                if (fqdn.indexOf('triton.zone') !== -1) {
                  grunt.file.write(`build/config/vhosts/${fqdn}`,
                    `${instance.name}/_design/www/_rewrite`);
                  grunt.log.writeln(`http://${fqdn}:5984`);
                  replication.triton.files[url] = 'build/replication/www.json';
                  grunt.config('couch-replication', replication);
                  var repdoc = JSON.stringify({
                    source: 'http://162.209.80.123:5984/lrwp',
                    target: 'lrwp',
                    continuous: true
                  });
                  grunt.file.write(replication.triton.files[url], repdoc);
                }
              });
              api.cloud.close();
              if (e) {
                throw e;
              }
              done();
            });
          });
        });
      });
    });
  });

  grunt.registerTask('default', [
    'jshint',
    'jsonlint:src',
    'clean:build',
    'mkdir',
    'copy',
    'clean:nodejs', // Tmp hack until src is restructured
    'uglify',
    'cssmin',
    'couch-compile',
    'jsonlint:ddoc',
    'jscs'
  ]);

  grunt.registerTask('provision', [
    'couchrc',
    'clean:config',
    'couch-triton',
    'couch-push',
    'couch-configure',
    'couch-replication'
  ]);

  grunt.registerTask('deploy', [
    'couchrc',
    'couch-push'
  ]);

};
