// @flow

import SETTINGS from 'alaska-settings';
import service from '../';

async function getLogo(key: string): Promise < string > {
  let logo = '';
  let pic = await SETTINGS.get(key);

  if (pic && pic.url) {
    logo = pic.url;
  }
  return logo;
}

export default async function (ctx: Alaska$Context) {
  let user = ctx.user;
  const loginLogo = await getLogo('adminLoginLogo');
  const logo = await getLogo('adminLogo');
  const icon = await getLogo('adminIcon');

  if (!user) {
    ctx.body = {
      user: {},
      settings: {
        locales: {
          'alaska-admin': service.locales,
        },
        locale: ctx.locale,
        loginLogo,
        logo,
        icon
      },
    };
    return;
  }

  ctx.session.lastAlive = Date.now();
  let access = await user.hasAbility('admin');
  let settings = {};

  if (access) {
    settings = await service.settings(ctx, user);
  } else {
    settings.locales = {
      'alaska-admin': service.locales
    };
  }

  settings.locale = ctx.locale;
  settings.logo = logo;
  settings.icon = icon;
  ctx.body = {
    // $Flow
    user: Object.assign({ access }, user.data()),
    settings
  };
};
