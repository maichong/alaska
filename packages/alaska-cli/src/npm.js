import npm from 'npm';

const commands = {};

Object.keys(npm.commands).forEach((key) => {
  commands[key] = function () {
    let args = Array.prototype.slice.apply(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (error, res) {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
      npm.commands[key].apply(npm.commands, args);
    });
  };
});

export function load(options) => {
  return new Promise((resolve, reject) => {
    npm.load(options, (error, res) => {
      if (error) {
        reject(error);
      } else {
        resolve(res);
      }
    });
  });
};

export var commands = commands;
