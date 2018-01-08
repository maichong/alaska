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
  timer: ?TimeoutID;

  constructor(options?: Alaska$Service$options) {
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
    _.forEach(drivers, (driver: Object, key) => {
      let label: string = driver.label || key;
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

    Email.fields.driver.options = driversOptions;
    Email.fields.driver.default = defaultDriver.key;

    let locales = alaska.main.getConfig('locales');
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

  async updateTasks() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    // $Flow
    this.nextTask = await EmailTask.findOne({ state: 1 }).sort('nextAt');
    if (!this.nextTask) return;

    let time = this.nextTask.nextAt.getTime() - Date.now();
    if (!time || time < 0) {
      time = 0;
    }
    this.timer = setTimeout(() => this.processTask().catch((e) => console.error(e.stack)), time);
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
    let email: ?Email = await Email.findById(task.email);
    if (!email) {
      this.updateTasks().catch((e) => console.error(e.stack));
      return;
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

    // $Flow
    task.lastUser = user._id;
    task.progress += 1;
    task.nextAt = new Date(Date.now() + (task.interval * 1000 || 0));
    task.save();
  }
}

export default new EmailService();
