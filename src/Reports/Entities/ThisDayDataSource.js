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
	addTransfroms(transforms) {
		if (~_.indexOf(transforms, 'waiting-time')) this.waitingTime = true;
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
		if (!this.waitingTime) return tickets;

		const datas = {};

		_.forEach(tickets, item => {

			if (!item.pack_member) return true;

			const session = item.session;

			item.session_data = (datas[item.session] || (datas[item.session] = {
				onhold: false,
				close_events: []
			}));

			if (item.state == "processing") {
				item.session_data.onhold = true;
				return true;
			}

			if (item.session_data.onhold) {
				return true;
			}

			const close_event = _.find(item.history, ['event_name', 'close']);

			if (close_event) {
				item.session_data.close_events.push(close_event);
			};
		});

		_.forEach(datas, item => {
			!item.onhold && (item.close_events = _.sortBy(item.close_events, "time"));
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



module.exports = ThisDaySource;;
