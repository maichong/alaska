"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const collie = require("collie");
const alaska_user_1 = require("alaska-user");
const AdminNav_1 = require("./models/AdminNav");
const AdminMenu_1 = require("./models/AdminMenu");
class AdminService extends alaska_1.Service {
    constructor(options) {
        super(options);
        collie(this, 'settings');
    }
    async settings(settings, user) {
        if (!settings.authorized)
            return;
        let horizontal = this.config.get('defaultHorizontal');
        _.forEach(this.main.modules.services, (s) => {
            let service = {
                id: s.id,
                models: {}
            };
            settings.services[s.id] = service;
            _.forEach(s.models, (m, modelName) => {
                let model = {
                    label: m.label,
                    modelName,
                    id: m.id,
                    key: m.key,
                    serviceId: s.id,
                    listMode: m.listMode,
                    preView: m.preView,
                    cardView: m.cardView,
                    editorView: m.editorView,
                    filterEditorView: m.filterEditorView,
                    titleField: m.titleField,
                    defaultSort: m.defaultSort,
                    defaultColumns: m.defaultColumns,
                    filterFields: m.filterFields,
                    groups: _.mapValues(m.groups, (group) => _.assign({ horizontal }, group)),
                    relationships: _.mapValues(m.relationships, (rel) => _.assign({}, rel, {
                        ref: typeof rel.ref === 'string' ? rel.ref : rel.ref.id
                    })),
                    actions: m.actions,
                    nocreate: m.nocreate,
                    noupdate: m.noupdate,
                    noremove: m.noremove,
                    noexport: m.noexport,
                    fields: {},
                    abilities: {}
                };
                _.forEach(m._fields, (f, path) => {
                    let field = f.viewOptions();
                    if (f.ref && f.ref.id) {
                        field.model = f.ref.id;
                        let titleField = '';
                        const [fServiceId, fModelName] = f.ref.id.split('.');
                        let fService = this.main.modules.services[fServiceId];
                        if (fService) {
                            let fModel = fService.models[fModelName];
                            if (fModel)
                                titleField = fModel.titleField;
                        }
                        field.modelTitleField = titleField || 'title';
                    }
                    model.fields[path] = field;
                });
                if (!model.fields._id) {
                    model.fields._id = {
                        label: 'ID',
                        path: '_id',
                        plainName: 'string',
                        cell: 'TextFieldCell',
                        view: 'TextFieldView',
                        hidden: 'isNew'
                    };
                }
                _.defaults(model.fields._id, {
                    fixed: 'id'
                });
                service.models[modelName] = model;
            });
        });
        settings.navItems = (await AdminNav_1.default.find()).map((doc) => doc.data());
        settings.menuItems = (await AdminMenu_1.default.find()).map((doc) => {
            if (!doc.parent && !doc.nav) {
                doc.nav = 'default';
                doc.save();
            }
            return doc.data();
        });
        _.forEach(await alaska_user_1.default.getUserAbilities(user), (ability) => {
            settings.abilities[ability] = true;
        });
    }
}
exports.default = new AdminService({
    id: 'alaska-admin'
});
