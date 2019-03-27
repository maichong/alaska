"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const alaska_user_1 = require("alaska-user");
const through = require("through");
const utils_1 = require("alaska-model/utils");
const tr = require("grackle");
const __1 = require("..");
const moment = require("moment");
function escapeText(text) {
    text = String(text);
    if (text.indexOf(',') > -1 || text.indexOf('"') > -1 || text.indexOf('\n') > -1) {
        return `"${text.replace(/"/g, '""').replace(/\n/g, '\r')}"`;
    }
    return text;
}
class Export extends alaska_sled_1.Sled {
    async exec(params) {
        const { model, ctx } = params;
        const ability = `${model.id}.export`;
        let abilityFilters;
        if (!ctx.state.ignoreAuthorization) {
            abilityFilters = await alaska_user_1.default.createFilters(params.admin, ability);
            if (!abilityFilters)
                __1.default.error('Access Denied', 403);
        }
        let filters = utils_1.mergeFilters(await model.createFiltersByContext(ctx), abilityFilters);
        let query = model.find(filters);
        let sort = ctx.state.sort || ctx.query._sort || model.defaultSort;
        if (sort) {
            query.sort(sort);
        }
        const stream = through();
        let filename = encodeURIComponent(tr.locale(ctx.locale)(model.label, model.service.id));
        ctx.set('Content-Disposition', `attachment; filename=${filename}.csv`);
        ctx.body = stream;
        let fields = ['_id'];
        let titles = ['id'];
        for (let key of Object.keys(model._fields)) {
            let field = model._fields[key];
            if (key === '_id') {
                if (field.noexport) {
                    fields.shift();
                    titles.shift();
                }
                continue;
            }
            if (field.noexport || field.hidden === true || field.protected === true)
                continue;
            fields.push(key);
            if (field.label) {
                titles.push(tr.locale(ctx.locale)(field.label, model.service.id));
            }
            else {
                titles.push(key.toUpperCase());
            }
        }
        let caches = {};
        async function getRefLabel(m, id) {
            let key = `${m.key}:${id}`;
            if (!caches[key]) {
                let record = await m.findById(id);
                if (record) {
                    caches[key] = record.get(m.titleField) || id;
                }
                else {
                    caches[key] = id;
                }
            }
            return caches[key];
        }
        setImmediate(() => {
            stream.write(`\ufeff${titles.map(escapeText).join(',')}\n`);
            query.cursor()
                .eachAsync(async (record) => {
                let data = [];
                for (let key of fields) {
                    let field = model._fields[key];
                    let value = record.get(key);
                    if (typeof value === 'undefined' || value === null) {
                        value = '';
                    }
                    if (field.private && await alaska_user_1.default.checkAbility(ctx.user, field.private, record)) {
                        value = '';
                    }
                    if (value && field.ref && field.ref.classOfModel) {
                        if (Array.isArray(value)) {
                            let labels = [];
                            for (let v of value) {
                                labels.push(await getRefLabel(field.ref, v));
                            }
                            value = labels.join(',');
                        }
                        else {
                            value = await getRefLabel(field.ref, value);
                        }
                    }
                    else if (field.options && field.type.fieldName === 'Select') {
                        let optionsMap = {};
                        _.forEach(field.options, (opt) => {
                            optionsMap[String(opt.value)] = opt.label;
                        });
                        if (Array.isArray(value)) {
                            value = value.map((v) => optionsMap[v] || v).join(',');
                        }
                        else {
                            value = optionsMap[value] || value;
                        }
                    }
                    else if (field.type.fieldName === 'Datetime') {
                        if (value) {
                            value = moment(value).format(field.format);
                        }
                        else {
                            value = '';
                        }
                    }
                    else if (record._ && record._[key] && record._[key].data) {
                        value = record._[key].data();
                    }
                    data.push(value);
                }
                stream.write(`${data.map(escapeText).join(',')}\n`);
            })
                .then(() => {
                stream.end();
            });
        });
    }
}
exports.default = Export;
