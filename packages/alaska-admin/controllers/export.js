'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _through = require('through');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function escape(text) {
  text = String(text);
  if (text.indexOf(',') > -1 || text.indexOf('"') > -1 || text.indexOf('\n') > -1) {
    return '"' + text.replace(/"/g, '""').replace(/\n/g, '\r') + '"';
  }
  return text;
} /* eslint no-inner-declarations:0 */

exports.default = async function list(ctx) {
  try {
    await ctx.checkAbility('admin');
    let serviceId = ctx.state.service || ctx.query._service;
    let modelName = ctx.state.model || ctx.query._model;
    if (!serviceId || !modelName) {
      _alaska2.default.error('Invalid parameters');
    }
    let s = _alaska2.default.services[serviceId];
    if (!s) {
      _alaska2.default.error('Invalid parameters');
    }
    let Model = s.getModel(modelName);

    let ability = _lodash2.default.get(Model, 'actions.export.ability', `admin.${Model.key}.export`);

    if (typeof ability === 'function') {
      _alaska2.default.error('Export action dose not support functional action ability!');
    }

    await ctx.checkAbility(ability);

    let filters = await Model.createFiltersByContext(ctx);

    let query = Model.find(filters);

    let sort = ctx.state.sort || ctx.query._sort || Model.defaultSort;
    if (sort) {
      query.sort(sort);
    }

    const stream = (0, _through2.default)();
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
      query.cursor().eachAsync(async record => {
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
                labels.push((await getRefLabel(field.ref, v)));
              }
              value = value.join(',');
            } else {
              value = await getRefLabel(field.ref, value);
            }
          } else if (field.options && field.type.typeName === 'select') {
            let optionsMap = {};
            // $Flow
            _lodash2.default.forEach(field.options, opt => {
              optionsMap[opt.value] = opt.label;
            });
            if (Array.isArray(value)) {
              value = value.map(v => optionsMap[v] || v).join(',');
            } else {
              value = optionsMap[value] || value;
            }
          } else if (record._ && record._[key] && record._[key].data) {
            value = record._[key].data();
          }

          data.push(value);
        }
        stream.write(data.map(escape).join(',') + '\n');
      }).then(() => {
        stream.end();
      });
    });
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    await ctx.show('error', { message: error.message });
  }
};