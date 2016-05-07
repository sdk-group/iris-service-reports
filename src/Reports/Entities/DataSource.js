'use strict'

/*@NOTE: test*/
let RDFcb = require("cbird-rdf").RD;
let cfg = {
	"couchbird": {
		"server_ip": "194.226.171.100",
		"n1ql": "194.226.171.100:8093"
	},
	"buckets": {
		"main": "rdf",
		"auth": "ss",
		"history": "rdf"
	},
	"filename": "./output.json"
};
let db = new RDFcb(cfg.couchbird);
let main_bucket = db.bucket(cfg.buckets.main);
/*@NOTE: test*/


let message_bus = require('global-queue');

let makeKey = (org, dedicated_date) => {
	let dd = _.isString(dedicated_date) ? dedicated_date : dedicated_date.format("YYYY-MM-DD");
	return `ticket-${org}-${dd}`;
};

class Source {
	constructor() {}
	setInterval(value) {
		this.interval = value;
		return this;
	}
	setDepartments(value) {
		this.departments = _.castArray(value);
		return this;
	}

	// parse(callback) {
	//
	// 	let response_counter = 0;
	// 	let days = this.getDays();
	// 	let set = [];
	// 	let first_date = _.head(days);
	// 	let last_date = _.last(days);
	//
	// 	_.forEach(days, d => _.forEach(this.departments, dept => set.push({
	// 		day: d,
	// 		department: dept
	// 	})));
	// 	//@TODO: use here iterator, not array
	// 	// console.log(set);
	//
	// 	Promise.map(set, item => this.getTickets({
	// 			query: {
	// 				dedicated_date: item.day,
	// 				org_destination: item.department
	// 			}
	// 		})
	// 		.then((data) => {
	// 			if (item.day == first_date) return this._preFilter(data, first_date);
	// 			if (item.day == last_date) return this._postFilter(data, last_date);
	// 			return data;
	// 		})
	// 		.then(callback)
	// 		.then(() => {
	// 			if ((response_counter += 1) == (days.length * this.departments.length)) this.final();
	//
	// 			return true;
	// 		}));
	//
	// 	return this;
	// }

	parse(callback) {
		let response_counter = 0;
		let days = this.getDays();
		let first_date = _.head(days);
		let last_date = _.last(days);

		let keys = [];
		let delimiter = '--';

		_.forEach(days, d => _.forEach(this.departments, dept => {
			keys.push(makeKey(dept, d));
		}));
		var chunktime = process.hrtime();
		main_bucket.getMulti(_.map(keys, k => `counter-${k}`)).then(d => {
				return d;
			}).then(data => _.reduce(data, (a, d, n) => {
				if (!!d.value) {
					let key = n.slice(8);
					a.push(_.map(_.range(d.value), (num) => `${key}${delimiter}${num}`))
				}
				return a;
			}, []))
			.then(d => _.flatten(d))
			.then(d => {
				console.log(d.length);
				return d;
			})
			.then(d => main_bucket.getMulti(d))
			.then(d => {
				console.log(_.size(d));
				var chdiff = process.hrtime(chunktime);
				console.log('chunk took %d msec', (chdiff[0] * 1e9 + chdiff[1]) / 1000000);
				return d;
			})
			.then(callback)
			.then(() => {
				this.final();
				return true;
			});

		return this;
	}
	_preFilter(tickets, first) {
		//@TODO: filter first day. ticket's date must be greater, then interval start
		console.log('filtering first ');
		return tickets;
	}
	_postFilter(tickets, last) {
		//@TODO: filter last day. ticket's date must be less , then interval end
		console.log('filtering last ');
		return tickets;
	}
	finally(callback) {
		this.final = callback;
	}
	getDays() {
		let start = moment(this.interval[0]).hour(0).minute(0).second(0);
		let end = moment(this.interval[1]).hour(0).minute(0).second(0);
		let days = end.diff(start, 'days');

		let dates = [start.format('YYYY-MM-DD')];
		for (var i = 0; i < days; i += 1) {
			dates.push(start.add(1, 'day').format('YYYY-MM-DD'))
		}

		return dates;
	}
	getTickets({
		query,
		keys
	}) {
		return message_bus.addTask('ticket', {
				_action: 'ticket',
				query,
				keys
			})
			.then((res) => {
				// console.log("RES Q", res, query);
				return _.values(res);
			});
	}
};

let DataSource = {
	discover(entity, interval_field) {
		//@TEST
		return this.ticketDataSource();
	},
	//@WARNING: only for tests
	ticketDataSource(interval) {
		let ticket_source = new Source()
		return ticket_source;
	}
};

module.exports = DataSource
