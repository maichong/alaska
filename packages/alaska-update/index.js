"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const AppUpdate_1 = require("./models/AppUpdate");
class UpdateService extends alaska_1.Service {
    async postInit() {
        const me = this;
        const main = this.main;
        if (main.config.get('autoUpdate')) {
            main.pre('ready', async () => {
                await me.update();
            });
        }
    }
    async update() {
        const { modules } = this.main;
        const serviceModules = modules.services[this.main.id];
        if (!serviceModules || _.isEmpty(serviceModules.updates))
            return;
        let locker;
        let lock = this.config.get('lock');
        if (lock) {
            locker = this.createDriver(lock);
            await locker.lock();
        }
        let records = await AppUpdate_1.default.find();
        let recordsMap = {};
        records.forEach((record) => {
            recordsMap[record.key] = record;
        });
        for (let key in serviceModules.updates) {
            if (recordsMap[key])
                continue;
            console.log('Apply update script', key);
            let mod = serviceModules.updates[key];
            if (!(typeof mod === 'function')) {
                console.log(`Update script "${key}" must export a async function as default!`);
                if (locker) {
                    await locker.unlock();
                }
                process.exit(1);
            }
            await mod();
            await (new AppUpdate_1.default({ key })).save();
        }
        if (locker) {
            await locker.unlock();
            locker.free();
        }
    }
}
exports.default = new UpdateService({
    id: 'alaska-update'
});
