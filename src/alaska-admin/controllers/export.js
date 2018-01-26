/* eslint no-inner-declarations:0 */

// @flow

import _ from 'lodash';
import alaska from 'alaska';
import through from 'through';

function escape(text) {
  text = String(text);
  if (text.indexOf(',') > -1 || text.indexOf('"') > -1) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export default async function list(ctx: Alaska$Context) {
  try {
    await ctx.checkAbility('admin');
    let serviceId = ctx.state.service || ctx.query._service;
    let modelName = ctx.state.model || ctx.query._model;
    if (!serviceId || !modelName) {
      alaska.error('Invalid parameters');
    }
    let s: Alaska$Service = alaska.services[serviceId];
    if (!s) {
      alaska.error('Invalid parameters');
    }
    let Model: Class<Alaska$Model> = s.getModel(modelName);

    let ability = _.get(Model, 'actions.export.ability', `admin.${Model.key}.export`);

    if (typeof ability === 'function') {
      alaska.error('Export action dose not support functional action ability!');
    }

    await ctx.checkAbility(ability);

    let filters = await Model.createFiltersByContext(ctx);

    let query = Model.find(filters);

    let sort = ctx.state.sort || ctx.query._sort || Model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    const stream = through();
    let filename = encodeURIComponent(Model.service.t(Model.label, ctx.locale));
    ctx.set('Content-Disposition', `attachment; filename=${filename}.csv`);
    ctx.body = stream;
    let fields = ['_id'];
    let titles = ['ID'];
    for (let key of Object.keys(Model._fields)) {
      let field = Model._fields[key];
      if (key === '_id') {
        if (field.noexport) {
          fields.shift();
          titles.shift();
        }
        continue;
      }
      if (field.noexport || field.hidden === true || field.private) continue;
      fields.push(key);
      if (field.label) {
        titles.push(Model.service.t(field.label, ctx.locale));
      } else {
        titles.push(key.toUpperCase());
      }
    }

    let caches = {};

    async function getRefLabel(model, id) {
      let key = model.key + ':' + id;
      if (!caches[key]) {
        let record = await model.findById(id);
        if (record) {
          caches[key] = record[model.titleField] || id;
        } else {
          caches[key] = id;
        }
      }
      return caches[key];
    }

    setImmediate(() => {
      stream.write(titles.map(escape).join(',') + '\n');
      query.cursor()
        .eachAsync(async(record) => {
          let data = [];
          for (let key of fields) {
            let value = record[key];
            if (value === undefined || value === null) {
              value = '';
            }
            let field = Model._fields[key];

            if (value && field.ref && field.ref.classOfModel) {
              if (Array.isArray(value)) {
                let labels = [];
                for (let v of value) {
                  labels.push(await getRefLabel(field.ref, v));
                }
                value = value.join(',');
              } else {
                value = await getRefLabel(field.ref, value);
              }
            } else if (field.options && field.type.typeName === 'select') {
              let optionsMap = {};
              // $Flow
              _.forEach(field.options, (opt: Object) => {
                optionsMap[opt.value] = opt.label;
              });
              if (Array.isArray(value)) {
                value = value.map((v) => optionsMap[v] || v).join(',');
              } else {
                value = optionsMap[value] || value;
              }
            } else if (record._ && record._[key] && record._[key].data) {
              value = record._[key].data();
            }

            data.push(value);
          }
          stream.write(data.map(escape).join(',') + '\n');
        })
        .then(() => {
          stream.end();
        });
    });
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    await ctx.show('error', { message: error.message });
  }
}
