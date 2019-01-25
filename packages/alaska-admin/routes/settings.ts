import { Router } from 'alaska-http';
import User from 'alaska-user/models/User';
import settingsService from 'alaska-settings';
import userService from 'alaska-user';
import service from '..';
import { Settings } from 'alaska-admin-view';

async function getLogo(key: string): Promise<string> {
  let logo = '';
  let pic = await settingsService.get(key);
  if (pic) {
    if (typeof pic === 'string') {
      logo = pic;
    } else if (pic.url) {
      logo = pic.url;
    }
  }
  return logo;
}

export default function (router: Router) {
  router.get('/settings', async (ctx) => {
    ctx.service = service;
    let user: User = ctx.user;
    let settings: Settings = {
      authorized: await userService.hasAbility(user, 'admin'),
      user: user ? user.data() : { id: '', username: '', avatar: '', displayName: 'Guest' },
      icon: await getLogo('adminIcon'),
      logo: await getLogo('adminLogo'),
      loginLogo: await getLogo('adminLoginLogo'),
      copyright: await settingsService.get('adminCopyright'),
      superMode: ctx.state.superMode || false,
      locale: ctx.locale || '',
      locales: {},
      abilities: {},
      services: {},
      models: {},
      navItems: [],
      menuItems: []
    };
    await service.settings(settings, user);
    // TODO:
    // ctx.session.lastAlive = Date.now();
    ctx.body = settings;
  });
}
