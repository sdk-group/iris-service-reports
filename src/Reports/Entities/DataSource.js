'use strict'

let message_bus = require('global-queue');

class Source {
	constructor() {
		this.concurrency = 3;
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
		//@TODO: filter first day. ticket's date must be greater, then interval start
		//@TODO: filter last day. ticket's date must be less , then interval end
		let response_counter = 0;
		let days = this.getDays();
		let set = [];

		_.forEach(days, d => _.forEach(this.departments, dept => set.push({
			day: d,
			department: dept
		})));

		//@TODO: use here iterator, not array
		Promise.map(set, item => this.getTickets({
				query: {
					dedicated_date: item.day,
					org_destination: item.department
				}
			})
			.then((r) => {
				console.log('batch', item.day, r.length);

				return r;
			})
			.then(callback)
			.then(() => {
				response_counter += 1;
				if (response_counter == days.length * this.departments.length) this.final();

				return true;
			}), {
				concurrency: this.concurrency
			});

		return this;
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
		console.log(dates);
		return dates;
	}
	getTickets({
		query,
		keys
	}) {
		return message_bus.addTask('ticket', {
				_action: 'ticket',
				query,
				keys
			})
			.then((res) => {
				// console.log("RES Q", res, query);
				return _.values(res);
			});
	}
};

let DataSource = {
	discover(entity, interval_field) {
		//@TEST
		return this.ticketDataSource();
	},
	//@WARNING: only for tests
	ticketDataSource(interval) {
		let ticket_source = new Source()
		return ticket_source;
	}
};

module.exports = DataSource