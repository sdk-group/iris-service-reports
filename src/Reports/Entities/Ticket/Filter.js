'use strict'

let TicketFilter = {
	isRegistered(ticket) {
		return ~_.findIndex(ticket.history, ['event_name', 'register'])
	},
	isNotActivated(ticket) {
		return false;
	}
};

module.exports = TicketFilter;