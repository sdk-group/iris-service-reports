'use strict'


//@FIXIT: completly rewrite all DataSource and stuff

const message_bus = require('global-queue');
const _ = require('lodash');

class ThisDaySource {
	constructor() {}
	setInterval(value) {
		this.interval = value;
		return this;
	}
	format(a) {
		return a;
	}
	setDepartments(value) {
		this.departments = _.castArray(value);
		return this;
	}
	parse(callback) {
		Promise.map(this.departments, department => {
			return message_bus.addTask("ticket-index", {
					_action: "today-tickets",
					organization: department
				})
				.then(tickets => this._processSessions(tickets))
				.then(callback);
		}).then(result => {
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

		_.forEach(tickets, (ticket, index) => {
			const inSessions = ticket.state == 'registered' && ~registered.indexOf(ticket.session);
			if (!inSessions) return true;

			const temp = _.cloneDeep(ticket);
			temp.state = "processing";
			tickets[index] = temp;
		});

		return tickets;
	}
	_preFilter(tickets, first) {
		//@TODO: filter first day. ticket's date must be greater, then interval start
		return tickets;
	}
	_postFilter(tickets, last) {
		//@TODO: filter last day. ticket's date must be less , then interval end
		return tickets;
	}
	finally(callback) {
		this.final = callback;
	}
};



module.exports = ThisDaySource;
