'use strict'

const group_delimiter = '::';

let Splitter = {
	compose(type, names) {
		console.log(names);
		let functions = _.map(names, name => this.discover(type, name));

		return this.build(functions);
	},
	discover(type, name) {
		//@TODO: discover by type

		if (_.isNaN(parseInt(name, 10))) {
			return this[name];
		}
		let interval = parseInt(name, 10);
		return (t) => this.minute(interval, t);
	},
	build(functions) {
		let composer = (data) => _.map(functions, f => f(data)).join(group_delimiter);

		return composer;
	},
	"minute": function (interval, date) {
		let now = moment.utc(date);
		return _.floor((now.hour() * 60 + now.minute()) / interval);
	},
	"month-day": function (date) {
		return moment.utc(date).date();
	},
	"month": function (date) {
		return moment.utc(date).month();
	},
	"week-day": function (date) {
		return moment.utc(date).day();
	}
};

module.exports = Splitter;