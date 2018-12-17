
import * as _ from 'lodash';
import { Service, ServiceOptions } from 'alaska';
import * as collie from 'collie';
import USER from 'alaska-user';
import User from 'alaska-user/models/User';
import * as AdminView from 'alaska-admin-view';
import { Model, ModelRelationship } from 'alaska-model';
import AdminNav from './models/AdminNav';
import AdminMenu from './models/AdminMenu';

/**
 * @class AdminService
 */
class AdminService extends Service {
  constructor(options: ServiceOptions) {
    super(options);
    collie(this, 'settings');
  }

  async settings(settings: AdminView.Settings, user: User) {
    if (!settings.authorized) return;
    let horizontal = this.config.get('defaultHorizontal');
    // services
    _.forEach(this.main.modules.services, (s) => {
      let service: AdminView.Service = {
        id: s.id,
        models: {}
      };
      settings.services[s.id] = service;

      _.forEach(s.models, (m: typeof Model, modelName) => {
        // @ts-ignore 某些属性需要在前端生成，eg. canUpdate
        console.log('m.relationships', m.relationships);
        let model: AdminView.Model = {
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
          defaultColumns: m.defaultColumns as string[],
          searchFields: m.searchFields as string[],
          // @ts-ignore 初始数据可能不完善
          groups: _.mapValues(m.groups, (group) => _.assign({ horizontal }, group)),
          // @ts-ignore 前后端类型定义不太一致
          relationships: _.mapValues(m.relationships, (rel: ModelRelationship) => _.assign({}, rel, {
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
          let field: AdminView.Field = f.viewOptions();
          //对ref类型的关联单独处理
          if (f.ref && f.ref.id) {
            //modelId
            field.model = f.ref.id;
            //显示的titleField
            let titleField = '';
            const [fServiceId, fModelName] = f.ref.id.split('.');
            let fService = this.main.modules.services[fServiceId];
            if (fService) {
              let fModel = fService.models[fModelName];
              if (fModel) titleField = fModel.titleField;
            }
            field.modelTitleField = titleField || 'title';
          }

          model.fields[path] = field;
        });
        if (!model.fields._id) {
          // @ts-ignore
          model.fields._id = {
            label: 'ID',
            path: '_id',
            plainName: 'string',
            cell: 'TextFieldCell',
            view: 'TextFieldView',
            hidden: '!id'
          };
        }
        _.defaults(model.fields._id, {
          fixed: 'id'
        });
        service.models[modelName] = model;
      });
    });

    // navs & menus
    settings.navItems = (await AdminNav.find()).map((doc) => doc.data());
    settings.menuItems = (await AdminMenu.find()).map((doc) => {
      if (!doc.parent && !doc.nav) {
        // 升级老版本alaska数据
        doc.nav = 'default';
        doc.save();
      }
      return doc.data();
    });

    // abilities
    _.forEach(await USER.getUserAbilities(user), (ability) => {
      settings.abilities[ability] = true;
    });
  }
}

export default new AdminService({
  id: 'alaska-admin'
});
