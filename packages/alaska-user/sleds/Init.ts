import * as _ from 'lodash';
import { ObjectMap } from 'alaska';
import { Sled } from 'alaska-sled';
import SETTINGS from 'alaska-settings';
import RegisterAbility from '../sleds/RegisterAbility';
import RegisterRole from '../sleds/RegisterRole';
import Ability from '../models/Ability';
import Role from '../models/Role';

export default class Init extends Sled<{}, void> {
  async exec() {
    let tasks: Promise<any>[] = [
      RegisterRole.run({
        id: 'root',
        title: 'Root',
        abilities: ['admin']
      }),

      RegisterRole.run({
        id: 'admin',
        title: 'Admin',
        abilities: ['admin']
      }),

      RegisterRole.run({
        id: 'user',
        title: 'User',
        abilities: ['user']
      }),

      RegisterRole.run({
        id: 'guest',
        title: 'Guest',
        abilities: []
      }),

      RegisterAbility.run({
        id: 'user',
        title: 'Authenticated user',
        service: 'alaska-user'
      }),

      RegisterAbility.run({
        id: 'admin',
        title: 'Admin login',
        service: 'alaska-admin'
      }),

      SETTINGS.register({
        id: 'user.closeRegister',
        title: 'Close Register',
        service: 'alaska-user',
        type: 'CheckboxFieldView',
      }),

      SETTINGS.register({
        id: 'user.closeRegisterReason',
        title: 'Close Register Reason',
        service: 'alaska-user',
        type: 'TextFieldView',
      })
    ];

    let res = await Promise.all(tasks);
    let root: Role = res[0];
    const rootAbilities: string[] = _.clone(root.abilities);

    let abilities: ObjectMap<Ability> = _.keyBy(await Ability.find(), 'id');

    for (let serviceId of Object.keys(this.service.main.modules.services)) {
      const { service } = this.service.main.modules.services[serviceId];
      if (!service.models) continue;
      for (let modelName of Object.keys(service.models)) {
        let Model = service.models[modelName];
        let ability = `${Model.id}.`;

        const registerAbility = async (action: string) => {
          if (action === 'add') return; // add Action 使用 create权限
          let id = ability + action;

          if (rootAbilities.indexOf(id) < 0) {
            rootAbilities.push(id);
          }

          if (abilities[id]) return;
          await RegisterAbility.run({
            id,
            title: `${action} ${Model.modelName}`,
            service: serviceId
          });
        };

        await Promise.all(['read', 'create', 'remove', 'update', 'export'].map(registerAbility));
        await Promise.all(_.keys(Model.actions).map(registerAbility));
      }
    }
    if (!_.isEqual(root.abilities, rootAbilities)) {
      root.abilities = rootAbilities;
      await root.save();
    }
  }
}
