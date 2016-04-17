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

		let response_counter = 0;
		let days = this.getDays();
		let set = [];
		let first_date = _.head(days);
		let last_date = _.last(days);

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
			.then((data) => {
				if (item.day == first_date) return this._preFilter(data, first_date);
				if (item.day == last_date) return this._postFilter(data, last_date);
				return data;
			})
			.then(callback)
			.then(() => {
				if ((response_counter += 1) == (days.length * this.departments.length)) this.final();

				return true;
			}), {
				concurrency: this.concurrency
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