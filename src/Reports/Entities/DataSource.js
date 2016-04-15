'use strict'

let message_bus = require('global-queue');

class Source {
	constructor(interval) {
		this.interval = interval;
	}
	parse(callback) {
		//@TODO: filter first day. ticket's date must be greater, then interval start
		//@TODO: filter last day. ticket's date must be less , then interval end
		let response_counter = 0;
		let days = this.getDays();
		_.forEach(days, (day) => this.getTickets({
				query: {
					dedicated_date: day,
					org_destination: 'department-1'
				}
			})
			.then((r) => {
				console.log('batch', day, r.length);
				return r;
			})
			.then(callback)
			.then(() => {


				response_counter += 1;
				if (response_counter == days.length) this.final();
			}));
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
	discover(entity, interval_field, interval) {
		//@TEST
		return this.ticketDataSource(interval);
	},
	//@WARNING: only for tests
	ticketDataSource(interval) {
		let ticket_source = new Source(interval)
		return ticket_source;
	}
};

module.exports = DataSource