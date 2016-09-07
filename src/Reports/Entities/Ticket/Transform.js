'use strict'

let _ = require('lodash');

let TicketTransforms = {
	waitingTime(ticket) {

		var call = _.find(ticket.history, ['event_name', 'call']);

		if (!call && register) {
			let day_end = (new Date(parseInt(register.time))).setHours(23, 59, 59);
			let now = Date.now();

			call = now < day_end ? {
				time: now
			} : false;
		}

		if (!register || !call) {
			ticket.waitingTime = -1;
			return;
		}

		ticket.waitingTime = call.time - register.time;
	}
};


module.exports = TicketTransforms;
