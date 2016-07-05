'use strict'

let _ = require('lodash');

let TicketTransforms = {
	waitingTime(ticket) {
		var register = _.find(ticket.history, ['event_name', 'register']) || _.find(ticket.history, ['event_name', 'activate']);
		var call = _.find(ticket.history, ['event_name', 'call']);
		if (!register || !call) {
			ticket.waitingTime = -1;
			return;
		}
		ticket.waitingTime = call.time - register.time;
	}
};


module.exports = TicketTransforms;
