"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const checkDepends = require("check-depends");
const alaska_1 = require("alaska");
const Ability_1 = require("./models/Ability");
const Role_1 = require("./models/Role");
const user_1 = require("./urrc/user");
const self_1 = require("./urrc/self");
class UserService extends alaska_1.Service {
    constructor(options) {
        super(options);
        this.urrc = new Map();
        this.urrc.set('user', user_1.default({ field: 'user' }));
        this.urrc.set('self', self_1.default());
    }
    postStart() {
        let cacheConfig = this.config.get('cache');
        if (cacheConfig && cacheConfig.type) {
            this.cache = this.createDriver(cacheConfig);
        }
    }
    async abilities() {
        let records = await Ability_1.default.find().sort('-sort');
        return records;
    }
    async roles() {
        let roles = await Role_1.default.find().sort('-sort');
        return roles;
    }
    async clearUserAbilitiesCache(user) {
        if (this.cache) {
            if (user) {
                let cacheKey = `cache:user-abilities:${user}`;
                await this.cache.del(cacheKey);
            }
            else {
                await this.cache.flush();
            }
        }
    }
    async getUserAbilities(user) {
        let result;
        let cacheKey = `cache:user-abilities:${user ? user.id : '_guest'}`;
        if (this.cache) {
            result = await this.cache.get(cacheKey);
            if (result)
                return result;
        }
        let roles = new Set();
        let abilities = new Set();
        if (!user || !user.id) {
            roles.add('guest');
        }
        else {
            roles.add('user');
            _.forEach(user.roles, (r) => roles.add(r));
            _.forEach(user.abilities, (a) => abilities.add(a));
        }
        let rolesMap = _.keyBy(await this.roles(), 'id');
        for (let role of roles) {
            let r = rolesMap[role];
            if (r) {
                _.forEach(r.abilities, (a) => abilities.add(a));
            }
        }
        result = Array.from(abilities);
        if (this.cache) {
            this.cache.set(cacheKey, result);
        }
        return result;
    }
    async checkAbility(user, conditions, record) {
        if (!conditions)
            return false;
        if (!Array.isArray(conditions))
            return checkDepends(conditions, record);
        if (!conditions.length)
            return true;
        for (let gate of conditions) {
            if (gate.check) {
                if (!checkDepends(gate.check, record))
                    continue;
            }
            if (gate.ability) {
                if (!await this.hasAbility(user, gate.ability, record))
                    continue;
            }
            return false;
        }
        return true;
    }
    async hasAbility(user, ability, record) {
        if (ability === 'every')
            return true;
        if (ability === 'god')
            return false;
        let abilities = await this.getUserAbilities(user);
        let [prefix, checker] = ability.split(':');
        if (!record) {
            if (abilities.includes(ability))
                return true;
            if (checker)
                return false;
            for (let str of abilities) {
                str = str.split(':')[0];
                if (str === ability)
                    return true;
            }
            return false;
        }
        if (checker && !this.urrc.has(checker)) {
            return false;
        }
        for (let str of abilities) {
            let [p, c] = str.split(':');
            if (prefix !== p)
                continue;
            if (checker && c !== checker)
                continue;
            if (!c)
                return true;
            if (!this.urrc.has(c))
                continue;
            if (await this.urrc.get(c).check(user, record))
                return true;
        }
        return false;
    }
    async createFilters(user, ability) {
        if (ability === 'every')
            return {};
        if (ability === 'god')
            return null;
        let abilities = await this.getUserAbilities(user);
        let relationships = [];
        let filters = [];
        for (let a of abilities) {
            if (ability === a)
                return {};
            let [prefix, relationship] = a.split(':');
            if (prefix === ability && relationship) {
                relationships.push(relationship);
            }
        }
        for (let r of relationships) {
            let checker = this.urrc.get(r);
            if (!checker)
                continue;
            let filter = await checker.filter(user);
            if (!_.find(filters, (f) => _.isEqual(f, filter))) {
                filters.push(filter);
            }
        }
        if (filters.length === 0)
            return null;
        if (filters.length === 1)
            return filters[0];
        return {
            $or: filters
        };
    }
    async trimProtectedField(data, user, model, record) {
        for (let key in data) {
            if (key === 'id')
                continue;
            let field = model._fields[key];
            if (!field)
                continue;
            if (field.protected && await this.checkAbility(user, field.protected, record)) {
                delete data[key];
                continue;
            }
            if (field.private && await this.checkAbility(user, field.private, record)) {
                delete data[key];
            }
        }
    }
    async trimPrivateField(data, user, model, record) {
        for (let key in data) {
            let field = model._fields[key];
            if (!field)
                continue;
            if (field.private && await this.checkAbility(user, field.private, record)) {
                delete data[key];
            }
        }
    }
    async trimDisabledField(data, user, model, record) {
        for (let key in data) {
            if (key === 'id')
                continue;
            let field = model._fields[key];
            if (!field
                || (field.disabled && await this.checkAbility(user, field.disabled, record))) {
                delete data[key];
            }
        }
    }
}
exports.default = new UserService({
    id: 'alaska-user'
});
