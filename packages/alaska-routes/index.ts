import * as _ from 'lodash';
import * as collie from 'collie';
import { MainService, Service, Extension } from 'alaska';
import { ServiceModules } from 'alaska-modules';
import { } from 'alaska-http';
import { RouteConfigurator } from 'alaska-routes';

export default class RoutesExtension extends Extension {
  static after = ['alaska-http'];

  constructor(main: MainService) {
    super(main);

    let inited: string[] = [];

    _.forEach(main.modules.services, (s: ServiceModules) => {
      let service: Service = s.service;

      collie(service, 'initRoutes', async () => {
        service.debug('initRoutes');
        inited.push(service.id);
        let prefix = service.config.get('prefix');
        if (prefix === false) return; // 强制关闭了 routes 路由
        _.forEach(s.plugins, (plugin) => {
          _.forEach(plugin.routes, (route: RouteConfigurator) => {
            route(main.getRouter(prefix));
          });
        });
        _.forEach(s.routes, (route: RouteConfigurator) => {
          route(main.getRouter(prefix));
        });

        // 挂载子Service接口
        // TODO: 采用更加安全的算法
        for (let [id, sub] of service.services) {
          if (inited.includes(id)) continue;
          await sub.initRoutes();
        }
      });
    });

    main.post('initHttp', async () => {
      await main.initRoutes();
    });
  }
}
