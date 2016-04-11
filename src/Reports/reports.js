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

let registry = require('./Entities/function-registry.js');

function discoverAgregator(name) {

}

function discoverSplitter(name) {
	if (_.isNaN(parseInt(name, 10))) {
		return registry.Common.Splitter[name];
	} else {
		let interval = parseInt(name, 10);

		return registry.Common.Splitter.minute.bind(null, interval);
	}
}

let sequence = function (fns) {
	return (result) => _.reduce(fns, (a, f) => f.call(this, a), result);
};

class Reports {
	constructor() {
		this.emitter = emitter;
	}
	init(config) {
		this.tickets = new TicketApi();
		this.tickets.initContent();
	}
	launch() {

		// setTimeout(() => {
		//
		// 	for (let i = 0; i < 10; i++) {
		// 		let d = moment();
		// 		d.add(-1 * i, 'days');
		// 		this.getTickets({
		// 			query: {
		// 				dedicated_date: d,
		// 				org_destination: 'department-1'
		// 			}
		// 		}).then((r) => {
		//
		// 		});
		//
		// 	}
		// }, 5000);

		//@NOTE: test
		let fn = this.composeGroupFunction();
		for (let i = 0; i < 10; i++) {
			let d = moment();
			d.add(-1 * i, 'days');
			console.log(fn(d.format()));
		}

		return Promise.resolve(true);
	}
	actionGetTable(table) {

	}
	getKeybuilder(entity) {

	}
	parseParams(param) {

	}
	composeGroupFunction(grouping_function) {
		grouping_function = table_draft.params[0].group;
		let functions = _.map(grouping_function, name => discoverSplitter(name));

		let result = (data) => {
			return _.map(functions, f => f(data)).join(group_delimiter);
		}

		return result;
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