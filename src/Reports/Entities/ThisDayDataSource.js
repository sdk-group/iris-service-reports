'use strict'


//@FIXIT: completly rewrite all DataSource and stuff

const message_bus = require('global-queue');


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
			}).then(callback);
		}).then(result => {
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
};



module.exports = ThisDaySource;
