'use strict'
let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

//@NOTE: it's draft
let table_draft = {
  interval: [0, 1000],
  entity: "Ticket",
  interval_field: "dedicated_date",
  params: [{
    label: "Param 1",
    group: ['month', 'week-day', '30min'],
    aggregator: "sum", //String const
    filter: ["state = registered"]
  }, {
    label: "Param 2"
      //...
  }]
};


let Splitters = require('./Entities/Splitter.js');
let Filters = require('./Entities/Filter.js');
let Aggregators = require('./Entities/Aggregator.js');

class Reports {
  constructor() {
    this.emitter = emitter;
  }
  init(config) {
    this.tickets = new TicketApi();
    this.tickets.initContent();
  }
  launch() {
    let entity_name = table_draft.entity;
    let group_names = table_draft.params[0].group;
    let filters = table_draft.params[0].filter;
    let group = Splitters.compose(entity_name, group_names);
    let composed = Filters.compose(entity_name, filters);
    setTimeout(() => {

      for (let i = 0; i < 10; i++) {
        let d = moment();
        d.add(-1 * i, 'days');
        this.getTickets({
          query: {
            dedicated_date: d,
            org_destination: 'department-1'
          }
        }).then((r) => {
          _.forEach(r, t => {
            console.log(group(t.booking_date));
            console.log(composed.filter(t));
            console.log(t.state);
          });

        });

      }
    }, 5000);



    return Promise.resolve(true);
  }
  actionGetTable(table) {

  }
  getKeybuilder(entity) {

  }
  parseParams(param) {

  }
  composeFilter(entity, filters) {
    let filters_functions = _.map(filters, desc => _.isObject(desc) ? this.findFilter(entity, desc) : this.parseFilter(desc));

    return sequence(filters_functions);
  }
  findFilter(entity, name) {

  }
  parseFilter(condition) {

  }

  //API
  getTickets({
    query,
    keys
  }) {
    return this.emitter.addTask('ticket', {
        _action: 'ticket',
        query,
        keys
      })
      .then((res) => {
        // console.log("RES Q", res, query);
        return _.values(res);
      });
  }

}
module.exports = Reports;