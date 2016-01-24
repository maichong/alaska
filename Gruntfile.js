/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-24
 * @author Liang <liang@maichong.it>
 */

var grunt = require('grunt');

require('load-grunt-tasks')(grunt);

grunt.initConfig({
  shell: {
    babel: {
      command: 'babel ./src --out-dir ./lib'
    }
  },
  watch: {
    src: {
      options: {},
      files: ['src/*.js', 'src/*/*.js'],
      tasks: ['shell']
    }
  }
});

grunt.registerTask('default', ['shell', 'watch']);
