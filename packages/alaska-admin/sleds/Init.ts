/* eslint no-inner-declarations:0 */

import * as _ from 'lodash';
import { ObjectMap } from 'alaska';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
import RegisterNav from './RegisterNav';
import RegisterMenu from './RegisterMenu';
import AdminMenu from '../models/AdminMenu';

/**
 * 自动已经系统中所有的模型,注册管理员后台菜单
 */
export default class Init extends Sled<{}, void> {
  async exec() {
    RegisterNav.run({
      id: 'default',
      label: 'Default',
      ability: 'admin',
      activated: true
    });

    RegisterMenu.run({
      id: 'admin.settings',
      label: 'Settings',
      icon: 'cogs',
      type: 'link',
      link: '/settings',
      ability: 'alaska-settings.Settings.update',
      service: 'alaska-settings',
      activated: true
    });

    settingsService.register({
      id: 'adminLogo',
      title: 'Admin Logo',
      service: 'alaska-admin',
      type: 'ImageFieldView'
    });

    settingsService.register({
      id: 'adminLoginLogo',
      title: 'Admin Login Logo',
      service: 'alaska-admin',
      type: 'ImageFieldView'
    });

    settingsService.register({
      id: 'adminIcon',
      title: 'Admin Icon',
      service: 'alaska-admin',
      type: 'ImageFieldView'
    });

    settingsService.register({
      id: 'adminCopyright',
      title: 'Admin Copyright',
      service: 'alaska-admin',
      type: 'TextFieldView',
      value: 'Powered By Alaska'
    });

    let menus: ObjectMap<AdminMenu> = _.reduce(await AdminMenu.find(), (res: ObjectMap<AdminMenu>, menu: AdminMenu) => {
      res[menu.id] = menu;
      return res;
    }, {});

    for (let serviceId of Object.keys(this.service.main.modules.services)) {
      const { service } = this.service.main.modules.services[serviceId];
      if (!service.models) continue;
      for (let modelName of Object.keys(service.models)) {
        let Model = service.models[modelName];

        if (Model.hidden) {
          continue;
        }
        let id = `model.${Model.service.id}.${Model.key}`.toLowerCase();
        if (menus[id]) {
          continue;
        }
        let ability = `${Model.id}.`;
        await RegisterMenu.run({
          id,
          label: Model.label,
          icon: Model.icon,
          type: 'link',
          link: `/list/${serviceId}/${Model.modelName}`,
          ability: `${ability}read`,
          service: serviceId,
          activated: true
        }).catch((e) => console.error(e.stack));
      }
    }
  }
}
