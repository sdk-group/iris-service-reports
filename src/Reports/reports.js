'use strict'

let emitter = require("global-queue");
let TicketApi = require('resource-management-framework').TicketApi;

let moment = require('moment-timezone');

require('moment-range');

let Splitters = require('./Entities/Splitter.js');
let Filters = require('./Entities/Filter.js');
let Aggregators = require('./Entities/Aggregator.js');
let DataSource = require('./Entities/DataSource.js');
let Transform = require('./Entities/Transform.js');

let RDFcb = require("cbird-rdf").RD;

let db = new RDFcb();


class Reports {
	constructor() {
		this.emitter = emitter;
	}
	init(config) {
		let bucket_name = config.default_bucket || "rdf";
		DataSource.setDefaultBucket(db.bucket(bucket_name));

		return Promise.resolve(true);
	}
	launch() {
		return Promise.resolve(true);
	}

	//API
	actionBootstrap() {
		console.log('Reports');

		return Promise.resolve(true);
	}
	actionReady() {
		return Promise.resolve(true);
	}
	actionGetTable({
		table
	}) {
		var time = process.hrtime();
		let rows = table.params;
		let entity_name = table.entity;

		let source = DataSource.discover(entity_name, table.interval);

		source.setInterval(table.interval)
			.setDepartments(table.department);
		let group = Splitters.compose(entity_name, table.group);

		let fns = _.mapValues(rows, row => ({
			filter: Filters.compose(entity_name, row.filter),
			aggregator: Aggregators.get(entity_name, row.aggregator),
			transform: Transform.compose(entity_name, row.transform)
		}));

		let accumulator = {};
		let meta = {};

		let result = new Promise(function (resolve, reject) {
			source.parse((data) => {
				_.forEach(data, (a) => {

					let data_row = a.value;
					if (!data_row) return true;

					let group_index = false;

					_.forEach(rows, (row, index) => {
						let key = row.key;
						let meta_key = row.meta;
						let transform = _.get(fns, [index, 'transform']);
						let filter = _.get(fns, [index, 'filter']);

						if (transform) transform(data_row);

						if (!filter(data_row)) return true;

						group_index = group_index || group(data_row);

						let exported = key ? data_row[key] : 1;
						_.updateWith(accumulator, [group_index, index], (n) => n ? (n.push(exported) && n) : [exported], Object);
						if (meta_key) {
							let fields = meta_key == 'all' ? data_row : _.pick(data_row, _.castArray(meta_key));
							_.updateWith(meta, [group_index, index], (n) => n ? (n.push(fields) && n) : [fields], Object);
						}
					})
				})

			}).finally(() => {
				let result = _.mapValues(accumulator, (group, group_index) => _.mapValues(group, (d, param_index) => {
					let value = fns[param_index].aggregator(d);
					return table.params[param_index].meta ? {
						value: value,
						meta: _.get(meta, [group_index, param_index])
					} : value;
				}));

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
