'use strict'

class Source {
	constructor(interval) {
		this.interval = interval;
	}
	parse(callback) {
		return this;
	}
	finally(callback) {
		this.final = callback;
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