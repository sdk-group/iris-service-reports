'use strict'

let _ = require('lodash');


let TicketTransforms = {
	waitingTime(ticket) {

		var register = _.findLast(ticket.history, ['event_name', 'route']) || _.find(ticket.history, ['event_name', 'register']) || _.find(ticket.history, ['event_name', 'activate']);
		var call = _.findLast(ticket.history, ['event_name', 'call']);


		if (!register) {
			ticket.waitingTime = -1;
			return;
		}

		//@NOTE: in case of routing
		if (call && (call.time < register.time)) call = false;

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
	},
	answers(ticket) {
		var answers = ticket.qa_answers;
		if (!answers) return;
		if (ticket.question0) return;

		for (var key in answers) {
			var index = key - 9;
			var answer = (answers[key] % 5) || 5;
			ticket['question' + index] = answer;
		}


		if (ticket.operator) return;
		let history = ticket.history;
		let oper = "";
		for (var i = 0; i < history.length; i++) {
			var entry = history[i];
			if (entry.event_name == "qa-check") break;
			if (entry.subject.type == "operator") oper = entry.subject.id;
		}
		ticket.operator = oper;
	}
};


module.exports = TicketTransforms;
