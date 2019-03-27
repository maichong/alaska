"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const User_1 = require("alaska-user/models/User");
const random = require("string-random");
const __1 = require("..");
class Client extends alaska_model_1.Model {
    preSave() {
        if (!this.token) {
            this.token = random(32);
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.expiredAt) {
            let clientExpiredTime = __1.default.config.get('clientExpiredTime');
            if (clientExpiredTime) {
                this.expiredAt = new Date(Date.now() + clientExpiredTime);
            }
        }
    }
}
Client.label = 'Client';
Client.icon = 'mobile';
Client.titleField = 'token';
Client.defaultColumns = '_id user platform deviceId token createdAt expiredAt';
Client.filterFields = '@search createdAt?swtich expiredAt?switch';
Client.defaultSort = '_id';
Client.api = {
    create: 1
};
Client.fields = {
    user: {
        label: 'User',
        type: 'relationship',
        ref: User_1.default,
        index: true,
        protected: true
    },
    deviceId: {
        label: 'Device ID',
        type: String,
        default: '',
        index: true,
        protected: true
    },
    platform: {
        label: 'Platform',
        type: String,
        default: '',
        protected: true
    },
    token: {
        label: 'Token',
        type: String,
        unique: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    },
    expiredAt: {
        label: 'Expired At',
        type: Date,
        protected: true
    }
};
exports.default = Client;
