"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
const Settings_1 = require("./models/Settings");
class SettingsService extends alaska_1.Service {
    constructor() {
        super(...arguments);
        this.settings = new Map();
    }
    async register(data) {
        let settings = await Settings_1.default.findById(data.id);
        if (settings) {
            return settings;
        }
        settings = new Settings_1.default(data);
        console.log('Register settings', settings);
        settings._id = data.id;
        this.debug('register', data.id);
        await settings.save();
        return settings;
    }
    async get(id) {
        let record = await Settings_1.default.findById(id);
        let value = record ? record.value : undefined;
        this.debug('get', id, '=>', value);
        return value;
    }
    async set(id, value) {
        this.debug('set', id, '=>', value);
        let record = await Settings_1.default.findById(id);
        if (!record) {
            return null;
        }
        record.value = value;
        await record.save();
        return record;
    }
    getSync(id) {
        return this.settings.get(id);
    }
    async postInit() {
        let list = await Settings_1.default.find();
        list.forEach((s) => {
            this.settings.set(s.id, s.value);
        });
        this._watch();
    }
    _watch() {
        let changeStream = Settings_1.default.watch([], {
            fullDocument: 'updateLookup'
        });
        changeStream.on('change', async (change) => {
            let doc = change.fullDocument;
            switch (change.operationType) {
                case 'insert':
                case 'update':
                    this.settings.set(doc._id, doc.value);
                    break;
            }
        });
        changeStream.on('close', () => {
            this._watch();
        });
    }
}
exports.SettingsService = SettingsService;
exports.default = new SettingsService({
    id: 'alaska-settings'
});
