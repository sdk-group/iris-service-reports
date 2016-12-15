'use strict'


//@FIXIT: completly rewrite all DataSource and stuff

const Source = require('./TicketDataSource.js');
const NowSource = require('./ThisDayDataSource.js');
const HistorySource = require('./HistoryDataSource.js');


let DataSource = {
	setDefaultBucket(default_bucket) {
		this.default_bucket = default_bucket;
	},
	discover(entity, interval) {
		//@TEST
		let strategy_name = entity.toLowerCase() + "DataSource";
		let strategy = this[strategy_name].bind(this);
		return strategy(interval);
	},
	//@WARNING: only for tests
	ticketDataSource(interval) {
		let ticket_source = interval === 'now' ? new NowSource() : new Source(this.default_bucket);
		return ticket_source;
	},
	historyDataSource() {
		return new HistorySource(this.default_bucket);
	}
};

module.exports = DataSource;
