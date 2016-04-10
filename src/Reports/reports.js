'use strict'
let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

//@NOTE: test
let Reg = require('./Entities/Service/registered.js');

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
  actionMakeReport(type, properties, interval) {

    //@NOTE: check cache here
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