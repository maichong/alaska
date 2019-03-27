"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class Address extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
    async postSave() {
        if (this.isDefault) {
            await Address.updateMany({ user: this.user, isDefault: true, _id: { $ne: this._id } }, { isDefault: false });
        }
    }
}
Address.label = 'Address';
Address.icon = 'map-marker';
Address.titleField = 'name';
Address.defaultColumns = 'user name tel province city district street detail isDefault';
Address.filterFields = 'user createdAt?range @search';
Address.defaultSort = '-createdAt';
Address.api = {
    create: 2,
    show: 2,
    list: 2,
    paginate: 2,
    remove: 2,
    update: 2
};
Address.fields = {
    user: {
        label: 'User',
        type: 'relationship',
        ref: 'alaska-user.User',
        required: true
    },
    name: {
        label: 'Name',
        type: String,
        default: ''
    },
    tel: {
        label: 'Tel',
        type: String
    },
    zip: {
        label: 'ZIP Code',
        type: String
    },
    geo: {
        label: 'GEO',
        type: 'geo'
    },
    country: {
        label: 'Country',
        type: String
    },
    province: {
        label: 'Province',
        type: String
    },
    city: {
        label: 'City',
        type: String
    },
    district: {
        label: 'District',
        type: String
    },
    street: {
        label: 'Street',
        type: String
    },
    building: {
        label: 'Building',
        type: String
    },
    detail: {
        label: 'Detail',
        type: String
    },
    isDefault: {
        label: 'Default',
        type: Boolean
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Address;
