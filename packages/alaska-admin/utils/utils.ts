import userService from 'alaska-user';
import { Model } from 'alaska-model';

export async function trimPrivateField(data: any, user: any, model: typeof Model, record: Model) {
  // eslint-disable-next-line guard-for-in
  for (let key in data) {
    let field = model._fields[key];
    if (!field) continue;
    if (field.private && await userService.checkAbility(user, field.private, record)) {
      delete data[key];
    }
  }
}

export async function trimDisabledField(data: any, user: any, model: typeof Model, record?: Model) {
  for (let key in data) {
    if (key === 'id') continue;
    let field = model._fields[key];
    if (
      !field
      || (field.disabled && await userService.checkAbility(user, field.disabled, record))
    ) {
      delete data[key];
    }
  }
}
