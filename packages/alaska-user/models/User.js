"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const __1 = require("..");
class User extends alaska_model_1.Model {
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        if (!this.displayName) {
            this.displayName = this.username;
        }
        this.__clearCache = this.isModified('abilities') || this.isModified('roles');
    }
    postSave() {
        if (this.__clearCache) {
            __1.default.clearUserAbilitiesCache(this.id);
        }
    }
    auth(candidate) {
        return this._.password.compare(candidate);
    }
}
User.label = 'User';
User.icon = 'user';
User.titleField = 'displayName';
User.defaultColumns = 'avatar username email roles createdAt';
User.searchFields = 'username tel displayName email';
User.filterFields = 'roles createdAt?range @search';
User.defaultSort = '-createdAt';
User.noremove = true;
User.scopes = {
    tiny: 'displayName avatar _username',
    info: '*'
};
User.relationships = {
    incomes: {
        optional: 'alaska-income',
        ref: 'alaska-income.Income',
        path: 'user'
    },
    commissions: {
        optional: 'alaska-commission',
        ref: 'alaska-commission.Commission',
        path: 'user'
    },
    withdraws: {
        optional: 'alaska-withdraw',
        ref: 'alaska-withdraw.Withdraw',
        path: 'user'
    },
    addresses: {
        optional: 'alaska-address',
        ref: 'alaska-address.Address',
        path: 'user'
    },
    orders: {
        optional: 'alaska-order',
        ref: 'alaska-order.Order',
        path: 'user'
    },
    carts: {
        optional: 'alaska-cart',
        ref: 'alaska-cart.CartGoods',
        path: 'user'
    },
    favorite: {
        optional: 'alaska-favorite',
        ref: 'alaska-favorite.Favorite',
        path: 'user'
    },
    events: {
        optional: 'alaska-event',
        ref: 'alaska-event.Event',
        path: 'user'
    },
};
User.fields = {
    username: {
        label: 'Username',
        type: String,
        unique: true,
        required: true,
        disabled: [{
                ability: 'alaska-user.User.update'
            }]
    },
    email: {
        label: 'Email',
        type: String,
        index: true,
        disabled: [{
                ability: 'alaska-user.User.update'
            }]
    },
    tel: {
        label: 'Tel',
        type: String,
        index: true,
        disabled: [{
                ability: 'alaska-user.User.update'
            }]
    },
    displayName: {
        label: 'Display Name',
        type: String
    },
    password: {
        label: 'Password',
        type: 'password',
        private: true,
        disabled: [{
                ability: 'alaska-user.User.update'
            }]
    },
    avatar: {
        label: 'Avatar',
        type: 'image'
    },
    roles: {
        label: 'Roles',
        type: 'relationship',
        ref: 'Role',
        multi: true,
        protected: true,
        disabled: [{
                ability: 'alaska-user.User.update'
            }],
        checkbox: true
    },
    abilities: {
        label: 'Abilities',
        type: 'relationship',
        ref: 'Ability',
        multi: true,
        protected: true,
        disabled: [{
                ability: 'alaska-user.User.update'
            }]
    },
    createdAt: {
        label: 'Registered At',
        type: Date,
        disabled: [{
                ability: 'alaska-user.User.update'
            }]
    }
};
exports.default = User;
