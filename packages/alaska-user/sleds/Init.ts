import * as _ from 'lodash';
import { ObjectMap } from 'alaska';
import { Sled } from 'alaska-sled';
import settingsService from 'alaska-settings';
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
        title: 'Authenticated user'
      }),

      RegisterAbility.run({
        id: 'admin',
        title: 'Admin login'
      }),

      RegisterAbility.run({
        id: 'root',
        title: 'Root'
      }),

      settingsService.register({
        id: 'user.closeRegister',
        title: 'Close Register',
        service: 'alaska-user',
        type: 'CheckboxFieldView',
      }),

      settingsService.register({
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

          if (['read', 'create', 'remove', 'update'].includes(action) && Model.fields.user) {
            let userAbility = id + ':user';
            if (!abilities[userAbility]) {
              await RegisterAbility.run({
                id: userAbility,
                title: `${action} own ${Model.modelName}`
              });
            }
          }

          if (abilities[id]) return;
          await RegisterAbility.run({
            id,
            title: `${action} all ${Model.modelName}`
          });
        };

        await Promise.all(['read', 'create', 'remove', 'update', 'export'].map(registerAbility));
        await Promise.all(_.keys(Model.actions).map(registerAbility));
      }
    }

    ['root', 'admin', 'user'].forEach((a) => {
      if (!rootAbilities.includes(a)) {
        rootAbilities.push(a);
      }
    });

    if (!_.isEqual(root.abilities, rootAbilities)) {
      root.abilities = rootAbilities;
      await root.save();
    }
  }
}
