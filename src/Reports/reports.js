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
		field: "key",
		group: ['month', 'week-day', '30min'],
		aggregator: "sum", //String const
		filter: ["state != registered"]
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
		let filter = Filters.compose(entity_name, filters);

		let last;
		setTimeout(() => {
			let d = moment("2016-04-11");
			this.getTickets({
				query: {
					dedicated_date: d,
					org_destination: 'department-1'
				}
			}).then((r) => {
				console.log('response');
				console.log(r.length);
				var time = process.hrtime();
				_.forEach(r, t => {
					// console.log(t.booking_date);
					// console.log(group(t.booking_date));
					// console.log(composed.filter(t));
					if (filter(t)) {
						console.log(t[table_draft.params[0].field]);
					}
					// console.log(t.state);
				});


				var diff = process.hrtime(time);

				console.log('benchmark took %d msec', (diff[0] * 1e9 + diff[1]) / 1000000);
			});
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