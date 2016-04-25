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

		let accumulator = _.mapValues(rows, row => ({}));
		let meta = _.mapValues(rows, row => ({}));

		let result = new Promise(function (resolve, reject) {
			source.parse((data) => {
				_.forEach(rows, (row, index) => {
					let key = row.key;
					let meta_key = row.meta;
					let filter = _.get(fns, [index, 'filter']);

					_.forEach(data, (data_row) => {
						if (!filter(data_row)) return true;
						let group_index = group(data_row);
						let exported = key ? data_row[key] : 1;

						_.update(accumulator, [index, group_index], (n) => n ? (n.push(exported) && n) : [exported]);
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