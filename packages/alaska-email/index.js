// @flow

import _ from 'lodash';
import alaska, { Service } from 'alaska';
import User from 'alaska-user/models/User';
import Email from './models/Email';
import EmailTask from './models/EmailTask';

class EmailService extends Service {
  driversOptions: Object[];
  defaultDriver: Object;
  driversMap: Object;

  nextTask: ?EmailTask;

  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.id = options.id || 'alaska-email';
    options.dir = options.dir || __dirname;
    super(options);
  }

  preLoadModels() {
    let drivers = this.config('drivers');
    if (!drivers || !Object.keys(drivers).length) {
      throw new Error('No email driver found');
    }
    let driversOptions = [];
    let defaultDriver = {};
    let driversMap = {};
    _.forEach(drivers, (driver, key) => {
      let label = driver.label || key;
      driver.key = key;
      driversOptions.push({ label, value: key });
      if (driver.send) {
        //已经实例化的driver
      } else if (driver.type) {
        // $Flow  require参数必须是文本字符串
        let Driver: Class<Alaska$EmailDriver> = require(driver.type).default;

        driver = new Driver(this, driver);
      } else {
        throw new Error('invalid email driver config ' + key);
      }
      driversMap[key] = driver;
      driver.key = key;
      if (!defaultDriver || driver.default) {
        defaultDriver = driver;
      }
    });
    this.driversOptions = driversOptions;
    this.defaultDriver = defaultDriver;
    this.driversMap = driversMap;

    Email.fields.driver.options = driversOptions;
    Email.fields.driver.default = defaultDriver.key;

    let locales = alaska.main.config('locales');
    if (locales && locales.length > 1) {
      Email.fields.content.help = 'Default';
      locales.forEach((locale) => {
        Email.fields['content_' + locale.replace('-', '_')] = {
          label: 'Content',
          type: String,
          multiLine: true,
          help: this.t('lang', locale)
        };
      });
    }
  }

  postMount() {
    setTimeout(() => this.updateTasks().catch((e) => console.error(e.stack)), 1000);
  }

  nextTask = null;
  timer = 0;

  async updateTasks() {
    const EmailTask = this.model('EmailTask');
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
    // $Flow
    let task = this.nextTask = await EmailTask.findOne({ state: 1 }).sort('nextAt');
    if (!task) return;

    let time = task.nextAt.getTime() - Date.now();
    if (!time || time < 0) {
      time = 0;
    }
    this.timer = setTimeout(() => this.processTask().catch((e) => console.error(e.stack)), time);
  }

  async processTask() {
    clearTimeout(this.timer);
    this.timer = 0;
    let task = this.nextTask;
    if (!task) {
      return;
    }
    // $Flow
    let email: ?Email = await Email.findById(task.email);
    if (!email) {
      return this.updateTasks().catch((e) => console.error(e.stack));
    }
    // $Flow
    let query = User.findOne(task._.filters.filter() || {}).where('email').ne(null);
    if (task.lastUser) {
      query.where('_id').gt(task.lastUser);
    }
    // $Flow
    let user: User = await query.sort('_id');
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

    task.lastUser = user._id;
    task.progress += 1;
    task.nextAt = new Date(Date.now() + (task.interval * 1000 || 0));
    task.save();
  }
}

export default new EmailService();
