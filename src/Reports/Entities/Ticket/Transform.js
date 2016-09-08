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
			let time = moment.parseZone(register.local_time);
			let day_start = time.startOf('day').format('x');
			register.time = parseInt(day_start) + parseInt(ticket.time_description[0] * 1000);
		}

		if (!call) {
			let time = moment.parseZone(register.local_time);
			let day_end = time.endOf('day').format('x');
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
