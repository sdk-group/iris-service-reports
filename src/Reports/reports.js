'use strict'
let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');
require('moment-range');

class Reports {
	constructor() {
		this.emitter = emitter;
	}
	init(config) {
		this.tickets = new TicketApi();
		this.tickets.initContent();

	}
	launch() {
		return Promise.resolve(true);
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