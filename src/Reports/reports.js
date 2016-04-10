'use strict'
let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

//@NOTE: test
let Reg = require('./Entities/Service/registered.js');

//@NOTE: it's draft
let table_draft = {
  interval: [0, 1000],
  entity: "Ticket",
  interval_field: "dedicated_date",
  params: [{
    label: "Param 1",
    group: ['interval literal', 'smaller interval literal', '60min'],
    agregator: "sum", //String const
    filter: [{
      field: "%field_name%",
      condition: "%field_name% > 10"
    }, {
      field: "%field_name%",
      condition: "%field_name% = meow"
    }]
  }, {
    label: "Param 2"
      //...
  }]
};

const group_delimiter = '::';

function discoverAgregator(name) {

}

function discoverSplitter(name) {

}

class Reports {
  constructor() {
    this.emitter = emitter;
  }
  init(config) {
    this.tickets = new TicketApi();
    this.tickets.initContent();
  }
  launch() {
    let R = new Reg();

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
  composeGroupFunction(groups) {

  }
  composeFilter(filter) {

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