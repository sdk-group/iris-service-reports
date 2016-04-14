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
		groupby: 'booking_date',
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
let DataSource = require('./Entities/DataSource.js');

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
						console.log(group(t.booking_date), t.history);
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
		let rows = table.params;
		let entity_name = table.entity;

		let source = DataSource.discover(entity_name, table.interval_field, table.interval);

		let fns = _.mapValues(rows, row => ({
			group: Splitters.compose(entity_name, row.group),
			filter: Filters.compose(entity_name, row.filter),
			aggregator: Aggregators.get(entity_name, row.aggregator)
		}));

		let accumulator = _.mapValues(rows, row => ({}));

		let table = new Promise(function (resolve, reject) {
			source.parse((data) => {
				_.forEach(rows, (row, index) => {

					let groupby = row.groupby;
					let key = row.key;
					let {
						group,
						filter
					} = fns[index];

					_.forEach(data, (data_row) => {
						if (!filter(data_row)) return true;

						let group_index = group(data_row[groupby]);
						if (!accumulator[index][group_index]) accumulator[index][group_index] = [];

						accumulator[index][group_index].push(data_row[key]);
					})

				})
			}).finally(() => {
				let result = _.mapValues(rows, (row, index) => {
					return _.map(accumulator, fns[index].aggregator);
				});

				resolve(result);
			});
		});

		return table
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