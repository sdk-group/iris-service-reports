'use strict';

const couchbase = require('couchbase');
const ViewQuery = couchbase.ViewQuery;

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
		let first_date = _.head(days);
		let last_date = _.last(days);

		let query = ViewQuery.from('reports', 'history');

		let start;
		let end;
		let id_start;
		let id_end;

		query.range(start, end, true).id_rang(id_start, id_end);
		// return Promise.map(chunks, keyset => this.main_bucket.getMulti(keyset).then(callback), {
		// 	concurrency: 3
		// });

		this.main_bucket.query(query, (err, result) => callback(result))
			.then(() => {
				this.final();
				return true;
			});
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
