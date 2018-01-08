'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _Email = require('./models/Email');

var _Email2 = _interopRequireDefault(_Email);

var _EmailTask = require('./models/EmailTask');

var _EmailTask2 = _interopRequireDefault(_EmailTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EmailService extends _alaska.Service {

  constructor(options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-email';
    options.dir = options.dir || __dirname;
    super(options);

    this.nextTask = null;
    this.timer = undefined;
  }

  preLoadModels() {
    let drivers = this.getConfig('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No email driver found');
    }
    let driversOptions = [];
    let defaultDriver = {};
    let driversMap = {};
    _lodash2.default.forEach(drivers, (driver, key) => {
      let label = driver.label || key;
      driversOptions.push({ label, value: key });
      if (driver.send) {
        //已经实例化的driver
      } else if (driver.type) {
        // $Flow
        driver = this.createDriver(driver);
      } else {
        throw new Error('invalid email driver config ' + key);
      }
      driversMap[key] = driver;
      // $Flow
      driver.key = key;
      if (!defaultDriver || driver.default) {
        defaultDriver = driver;
      }
    });
    this.driversOptions = driversOptions;
    this.defaultDriver = defaultDriver;
    this.driversMap = driversMap;

    _Email2.default.fields.driver.options = driversOptions;
    _Email2.default.fields.driver.default = defaultDriver.key;

    let locales = _alaska2.default.main.getConfig('locales');
    if (locales && locales.length > 1) {
      _Email2.default.fields.content.help = 'Default';
      locales.forEach(locale => {
        _Email2.default.fields['content_' + locale.replace('-', '_')] = {
          label: 'Content',
          type: String,
          multiLine: true,
          help: this.t('lang', locale)
        };
      });
    }
  }

  postMount() {
    setTimeout(() => this.updateTasks().catch(e => console.error(e.stack)), 1000);
  }

  async updateTasks() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    // $Flow
    this.nextTask = await _EmailTask2.default.findOne({ state: 1 }).sort('nextAt');
    if (!this.nextTask) return;

    let time = this.nextTask.nextAt.getTime() - Date.now();
    if (!time || time < 0) {
      time = 0;
    }
    this.timer = setTimeout(() => this.processTask().catch(e => console.error(e.stack)), time);
  }

  async processTask() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    let task = this.nextTask;
    if (!task) {
      return;
    }
    // $Flow
    let email = await _Email2.default.findById(task.email);
    if (!email) {
      this.updateTasks().catch(e => console.error(e.stack));
      return;
    }
    // $Flow
    let query = _User2.default.findOne(task._.filters.filter() || {}).where('email').ne(null);
    if (task.lastUser) {
      query.where('_id').gt(task.lastUser);
    }
    // $Flow
    let user = await query.sort('_id');
    if (!user) {
      task.state = 3;
      task.save();
      return;
    }

    try {
      this.run('Send', { email, to: user, values: { user } });
    } catch (err) {
      console.error(err.stack);
    }

    // $Flow
    task.lastUser = user._id;
    task.progress += 1;
    task.nextAt = new Date(Date.now() + (task.interval * 1000 || 0));
    task.save();
  }
}

exports.default = new EmailService();