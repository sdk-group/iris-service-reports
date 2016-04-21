'use strict'
let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

//@NOTE: it's draft
let table_draft = {
	interval: ["2016-04-07", "2016-04-14"],
	entity: "Ticket",
	interval_field: "dedicated_date",
	department: ['department-1', 'department-2'],
	params: [{
		label: "Param 1",
		key: "id",
		group: [{
			method: 'month',
			field: 'booking_date'
		}, {
			method: 'month-day',
			field: 'booking_date'
		}, {
			method: '60min',
			field: 'booking_date'
		}, {
			method: 'enum',
			field: "org_destination"
		}],
		aggregator: "count", //String const
		filter: [],
		meta: 'id'
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
		return Promise.resolve(true);
	}

	//API
	actionGetTable({
		table
	}) {
		let rows = table.params;
		let entity_name = table.entity;

		let source = DataSource.discover(entity_name, table.interval_field);

		source.setInterval(table.interval)
			.setDepartments(table.department);

		let fns = _.mapValues(rows, row => ({
			group: Splitters.compose(entity_name, row.group),
			filter: Filters.compose(entity_name, row.filter),
			aggregator: Aggregators.get(entity_name, row.aggregator)
		}));

		let accumulator = _.mapValues(rows, row => ({}));
		let meta = _.mapValues(rows, row => ({}));

		let result = new Promise(function (resolve, reject) {
			source.parse((data) => {
				_.forEach(rows, (row, index) => {
					let key = row.key;
					let meta_key = row.meta;
					let {
						group,
						filter
					} = fns[index];

					_.forEach(data, (data_row) => {
						if (!filter(data_row)) return true;
						let group_index = group(data_row);

						_.update(accumulator, [index, group_index], (n) => n ? (n.push(data_row[key]) && n) : [data_row[key]]);
						if (meta_key) _.update(meta, [index, group_index], (n) => n ? (n.push(data_row[meta_key]) && n) : [data_row[meta_key]]);
					})

				})
			}).finally(() => {

				let result = _.mapValues(rows, (row, index) => {
					if (table.params[index].meta) {
						return _.mapValues(accumulator[index], (d, p) => ({
							value: fns[index].aggregator(d),
							meta: _.get(meta, [index, p])
						}));
					}
					return _.mapValues(accumulator[index], fns[index].aggregator);
				});

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