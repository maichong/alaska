import * as _ from 'lodash';
import { ObjectMap } from 'alaska';
import { Sled } from 'alaska-sled';
import { Model } from 'alaska-model';
import userService from 'alaska-user';
import * as through from 'through';
import { mergeFilters } from 'alaska-model/utils';
import * as tr from 'grackle';
import { SelectOption } from '@samoyed/types';
import service, { ActionSledParams } from '..';
import moment = require('moment');

function escapeText(text: any) {
  text = String(text);
  if (text.indexOf(',') > -1 || text.indexOf('"') > -1 || text.indexOf('\n') > -1) {
    return `"${text.replace(/"/g, '""').replace(/\n/g, '\r')}"`;
  }
  return text;
}

/**
 * 到处数据
 */
export default class Export extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    const { model, ctx } = params;

    const ability = `${model.id}.export`;

    let abilityFilters = await userService.createFilters(params.admin, ability);
    if (!abilityFilters) service.error('Access Denied', 403);

    let filters = mergeFilters(await model.createFiltersByContext(ctx), abilityFilters);

    let query = model.find(filters);

    let sort = ctx.state.sort || ctx.query._sort || model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    const stream = through();
    let filename = encodeURIComponent(tr.locale(ctx.locale)(model.label, model.service.id));
    ctx.set('Content-Disposition', `attachment; filename=${filename}.csv`);
    ctx.body = stream;
    let fields = ['_id'];
    let titles = ['id'];
    for (let key of Object.keys(model._fields)) {
      let field = model._fields[key];
      if (key === '_id') {
        if (field.noexport) {
          fields.shift();
          titles.shift();
        }
        continue;
      }
      if (field.noexport || field.hidden === true || field.protected === true) continue;
      fields.push(key);
      if (field.label) {
        titles.push(tr.locale(ctx.locale)(field.label, model.service.id));
      } else {
        titles.push(key.toUpperCase());
      }
    }

    let caches: ObjectMap<string> = {};

    async function getRefLabel(model: typeof Model, id: string) {
      let key = `${model.key}:${id}`;
      if (!caches[key]) {
        let record = await model.findById(id);
        if (record) {
          caches[key] = record.get(model.titleField) || id;
        } else {
          caches[key] = id;
        }
      }
      return caches[key];
    }
    setImmediate(() => {
      stream.write(`${titles.map((title) => JSON.stringify(title)).join(',')}\n`);
      query.cursor()
        .eachAsync(async (record: Model) => {
          let data = [];
          for (let key of fields) {
            let field = model._fields[key];
            let value = record.get(key);
            if (typeof value === 'undefined' || value === null) {
              value = '';
            }
            if (field.private && await userService.checkAbility(ctx.user, field.private, record)) {
              // 字段保护
              value = '';
            }
            if (value && field.ref && field.ref.classOfModel) {
              if (Array.isArray(value)) {
                let labels = [];
                for (let v of value) {
                  labels.push(await getRefLabel(field.ref, v));
                }
                value = labels.join(',');
              } else {
                value = await getRefLabel(field.ref, value);
              }
            } else if (field.options && field.type.fieldName === 'Select') {
              let optionsMap: ObjectMap<string> = {};
              _.forEach(field.options, (opt: SelectOption) => {
                optionsMap[String(opt.value)] = opt.label;
              });
              if (Array.isArray(value)) {
                value = value.map((v) => optionsMap[v] || v).join(',');
              } else {
                value = optionsMap[value] || value;
              }
            } else if (field.type.fieldName === 'Datetime') {
              value = moment(value).format(field.format);
            } else if (record._ && record._[key] && record._[key].data) {
              value = record._[key].data();
            }

            data.push(value);
          }
          stream.write(`${data.map(escapeText).join(',')}\n`);
        })
        .then(() => {
          stream.end();
        });
    });

  }
}
