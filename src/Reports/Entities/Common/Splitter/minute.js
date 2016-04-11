'use strict'

module.exports = function (interval, date) {
	let now = moment(date);
	return _.floor((now.hour() * 60 + now.minute()) / interval);
};