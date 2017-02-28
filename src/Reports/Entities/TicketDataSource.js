'use strict';

const _ = require('lodash');

const makeKey = (org, dedicated_date) => {
	let dd = _.isString(dedicated_date) ? dedicated_date : dedicated_date.format("YYYY-MM-DD");
	return `ticket-${org}-${dd}`;
};

class Source {
	constructor(main_bucket) {
		this.main_bucket = main_bucket;
	}
	format(a) {
		return a.value;
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

		let keys = [];
		let delimiter = '--';

		_.forEach(days, d => _.forEach(this.departments, dept => {
			keys.push(makeKey(dept, d));
		}));

		const counters = _.map(keys, k => `counter-${k}`);

		this.main_bucket.getMulti(counters).then(data => {
				return _.flatten(_.reduce(data, (a, d, n) => {
					if (!_.isNumber(d.value)) return a;

					const key = n.slice(8);
					a.push(_.map(_.range(d.value + 1), (num) => `${key}${delimiter}${num}`))

					return a;
				}, []));
			})
			.then(keys => {
				let chunks = _.chunk(keys, 1000);

				return Promise.map(chunks, keyset => this.main_bucket.getMulti(keyset)
					.then(data => {
						this._processSessions(data.value);
						return data;
					})
					.then(callback), {
						concurrency: 3
					});
			}).then(() => {
				this.final();
				return true;
			});
		return this;
	}
	_processSessions(tickets) {
		const registered = _.chain(tickets)
			.filter(ticket => (ticket.pack_member && ticket.state == 'processing'))
			.map('session')
			.value();

		if (registered && registered.length) return tickets;

		_.forEach(tickets, (ticket) => {
			const inSessions = ticket.state == 'registered' && ~registered.indexOf(ticket.session);
			if (!inSessions) return true;

			ticket.state = "processing";
		});

		return tickets;
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

module.exports = Source;
