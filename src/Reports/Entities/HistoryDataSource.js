'use strict';

const couchbase = require('couchbase');
const ViewQuery = couchbase.ViewQuery;

const makeKey = (org, dedicated_date) => {
	let dd = _.isString(dedicated_date) ? dedicated_date : dedicated_date.format("YYYY-MM-DD");
	return `ticket-${org}-${dd}`;
};

class HistorySource {
	constructor(main_bucket) {
		this.main_bucket = main_bucket;
	}
	setInterval(value) {
		this.interval = value;
		return this;
	}
	setDepartments(value) {
		this.departments = _.castArray(value);
		return this;
	}
	parse(callback) {
		let response_counter = 0;
		let days = this.getDays();
		let start = _.head(days);
		let end = _.last(days);

		let query = ViewQuery.from('reports', 'history');

		let start_key = [_.head(this.departments)];
		let end_key = [_.last(this.departments)];
		let id_start = makeKey(start, '0');
		let id_end = makeKey(end, '9999');

		query.range(start_key, end_key, true).id_rang(id_start, id_end);
		// return Promise.map(chunks, keyset => this.main_bucket.getMulti(keyset).then(callback), {
		// 	concurrency: 3
		// });

		this.main_bucket._bucket
			.query(query, (err, result) => {
				callback(result);
				this.final();
			})

		return this;
	}
	_preFilter(tickets, first) {
		//@TODO: filter first day. ticket's date must be greater, then interval start
		console.log('filtering first ');
		return tickets;
	}
	_postFilter(tickets, last) {
		//@TODO: filter last day. ticket's date must be less , then interval end
		console.log('filtering last ');
		return tickets;
	}
	finally(callback) {
		this.final = callback;
	}
	getDays() {
		let start = moment(this.interval[0]).hour(0).minute(0).second(0);
		let end = moment(this.interval[1]).hour(0).minute(0).second(0);
		let days = end.diff(start, 'days');

		let dates = [start.format('YYYY-MM-DD')];
		for (var i = 0; i < days; i += 1) {
			dates.push(start.add(1, 'day').format('YYYY-MM-DD'))
		}

		return dates;
	}
};

module.exports = HistorySource;
