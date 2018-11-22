import * as _ from 'lodash';
import { Extension, Service, MainService } from 'alaska';
import { ServiceModules } from 'alaska-modules';
import { SledGenerator, SledSettings } from '.';
import Sled from './sled';
import debug from './debug';

export { Sled };

function setSledDefaults(sled: typeof Sled, service: Service, name: string) {
  if (!sled.service) sled.service = service;
  if (!sled.sledName) sled.sledName = name;
  if (!sled.id) sled.id = sled.id + '.' + name;
}

export default class SledExtension extends Extension {
  static after = ['alaska-model'];

  constructor(main: MainService) {
    super(main);
    Sled.main = main;

    _.forEach(main.modules.services, (s: ServiceModules) => {
      let service: Service = s.service;
      service.sleds = {};
      _.forEach(s.sleds, (sled: typeof Sled, name: string) => {
        service.sleds[name] = sled;
        setSledDefaults(sled, service, name);
      });

      // plugins
      _.forEach(s.plugins, (plugin, pluginName) => {
        _.forEach(plugin.sleds, (settings, name) => {
          if (typeof settings === 'function' && (settings as typeof Sled).classOfSled) {
            service.sleds[name] = (settings as typeof Sled);
          } else {
            // SledGenerator
            service.sleds[name] = (settings as SledGenerator)(service.sleds[name]);
            if (!service.models[name] || !service.models[name].classOfModel) {
              throw new Error(`Sled generator should return a Sled class [${pluginName}/sleds/${name}]`);
            }
            setSledDefaults(service.sleds[name], service, name);
            return;
          }

          // Sled settings

          if (!settings) {
            throw new Error(`Invalid sled settings [${pluginName}/sled/${name}]`);
          }

          let sled: typeof Sled = service.sleds[name];
          if (!sled) throw new Error(`Can not apply sled settings, ${service.id}.${name} not found!`);
          let { pre, post } = settings as SledSettings;
          if (pre) sled.pre(pre);
          if (post) sled.post(post);
        });
      });
    });

    main.pre('start', async () => {
      for (let sid of Object.keys(main.modules.services)) {
        let service: Service = main.modules.services[sid].service;
        let Init = service.sleds.Init;
        if (!Init) continue;
        debug(sid, 'Init');
        await Init.run();
      }
    });
  }
}
