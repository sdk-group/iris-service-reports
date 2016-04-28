'use strict'

let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

let Splitters = require('./Entities/Splitter.js');
let Filters = require('./Entities/Filter.js');
let Aggregators = require('./Entities/Aggregator.js');
let DataSource = require('./Entities/DataSource.js');

class Reports {
  constructor() {
    this.emitter = emitter;
  }
  init(config) {}
  launch() {
    return Promise.resolve(true);
  }

  //API
  actionGetTable({
    table
  }) {
    var time = process.hrtime();
    let rows = table.params;
    let entity_name = table.entity;

    let source = DataSource.discover(entity_name, table.interval_field);

    source.setInterval(table.interval)
      .setDepartments(table.department);
    let group = Splitters.compose(entity_name, table.group);

    let fns = _.mapValues(rows, row => ({
      filter: Filters.compose(entity_name, row.filter),
      aggregator: Aggregators.get(entity_name, row.aggregator)
    }));

    let accumulator = {};
    let meta = {};

    let result = new Promise(function(resolve, reject) {
      source.parse((data) => {
        _.forEach(rows, (row, index) => {
          let key = row.key;
          let meta_key = row.meta;
          let filter = _.get(fns, [index, 'filter']);

          _.forEach(data, (data_row) => {
            if (!filter(data_row)) return true;
            let group_index = group(data_row);
            let exported = key ? data_row[key] : 1;
            _.updateWith(accumulator, [group_index, index], (n) => n ? (n.push(exported) && n) : [exported], Object);
            if (meta_key) _.updateWith(meta, [group_index, index], (n) => n ? (n.push(data_row[meta_key]) && n) : [data_row[meta_key]], Object);
          })

        })
      }).finally(() => {
        let result = _.mapValues(accumulator, (group, group_index) => _.mapValues(group, (d, param_index) => {
          let value = fns[param_index].aggregator(d);
          return table.params[param_index].meta ? {
            value: value,
            meta: _.get(meta, [group, index])
          } : value;
        }));

        var diff = process.hrtime(time);
        console.log('table took %d msec', (diff[0] * 1e9 + diff[1]) / 1000000);

        resolve(result);
      });
    });

    return result;
  }
  actionGetTableTemplate() {
    //@NOTE: get template from DB
    //return Template_Object
  }


}
module.exports = Reports;
