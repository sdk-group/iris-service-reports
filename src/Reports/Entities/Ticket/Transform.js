'use strict'

let _ = require('lodash');

let TicketTransforms = {
	waitingTime(ticket) {

		var register = _.findLast(ticket.history, ['event_name', 'route']) || _.find(ticket.history, ['event_name', 'register']) || _.find(ticket.history, ['event_name', 'activate']);
		var call = _.find(ticket.history, ['event_name', 'call']);

		if (!register) {
			ticket.waitingTime = -1;
			return;
		}

		if (register.event_name == 'activate') {
			let time = parseInt(register.time);
			let day_start = (new Date(time)).setHours(0, 0, 0);
			register.time = day_start + ticket.time_description[0] * 1000;
		}

		if (!call && register) {
			let time = parseInt(register.time);
			let day_end = (new Date(time)).setHours(23, 59, 59);
			let now = Date.now();

			call = now < day_end ? {
				time: now
			} : false;
		}

		if (!call) {
			ticket.waitingTime = -1;
			return;
		}

		ticket.waitingTime = call.time - register.time;
	}
};


module.exports = TicketTransforms;
