'use strict'

class ReportServiceRegistered {
	constructor(interval) {
		this.interval = interval;
	}
	process(data) {
		let q = _.filter(data, ticket => !!_.find(ticket.history, {
			event_name: "register"
		}));

		return q.length;
	}
}

module.exports = ReportServiceRegistered;