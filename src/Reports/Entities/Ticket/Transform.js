'use strict'

let _ = require('lodash');

let TicketTransforms = {
	waitingTime(ticket) {
		console.log("Label", ticket.label);
		var register = _.find(ticket.history, ['event_name', 'register']) || _.find(ticket.history, ['event_name', 'activate']);
		var call = _.find(ticket.history, ['event_name', 'call']);

		if (!call && register) {
			let day_end = (new Date(parseInt(register.time))).setHours(23, 59, 59);
			let now = Date.now();
			console.log(now, register.time);
			call = now < day_end ? {
				time: now
			} : false;
		}

		if (!register || !call) {
			ticket.waitingTime = -1;
			return;
		}

		ticket.waitingTime = call.time - register.time;
		console.log(ticket.waitingTime, ticket.state);
	}
};


module.exports = TicketTransforms;
