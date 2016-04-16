'use strict'
let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

//@NOTE: it's draft
let table_draft = {
	interval: ["2016-04-01", "2016-04-14"],
	entity: "Ticket",
	interval_field: "dedicated_date",
	params: [{
		label: "Param 1",
		key: "id",
		group: ['month', 'month-day', '60min'],
		groupby: 'booking_date',
		aggregator: "count", //String const
		filter: []
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
		var time = process.hrtime();

		this.actionGetTable({
			table: table_draft
		}).then(d => {

			var diff = process.hrtime(time);

			console.log('request took %d msec', (diff[0] * 1e9 + diff[1]) / 1000000);
			console.log('result', d)
		});

		return Promise.resolve(true);
	}

	//API
	actionGetTable({
		table,
		workstation
	}) {
		let rows = table.params;
		let entity_name = table.entity;

		let source = DataSource.discover(entity_name, table.interval_field, table.interval);

		let fns = _.mapValues(rows, row => ({
			group: Splitters.compose(entity_name, row.group),
			filter: Filters.compose(entity_name, row.filter),
			aggregator: Aggregators.get(entity_name, row.aggregator)
		}));

		let accumulator = _.mapValues(rows, row => ({}));

		let result = new Promise(function (resolve, reject) {
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
						// console.log(accumulator);
				})
			}).finally(() => {

				let result = _.mapValues(rows, (row, index) => {
					return _.mapValues(accumulator[index], (d) => ({
						value: fns[index].aggregator(d),
						meta: {}
					}));
				});

				resolve(result);
			});
		});

		return result;
	}



}
module.exports = Reports;