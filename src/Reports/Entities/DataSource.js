'use strict'


//@FIXIT: completly rewrite all DataSource and stuff

const Source = require('./TicketDataSource.js');
const NowSource = require('./ThisDayDataSource.js');


let DataSource = {
	setDefaultBucket(default_bucket) {
		this.default_bucket = default_bucket;
	},
	discover(entity, interval_field) {
		//@TEST
		return this.ticketDataSource(interval_field);
	},
	//@WARNING: only for tests
	ticketDataSource(interval) {
		let ticket_source = interval == 'now' ? new NowSource() : new Source(this.default_bucket);
		return ticket_source;
	}
};

module.exports = DataSource;
