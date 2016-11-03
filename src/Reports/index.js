'use strict'

let events = {
	reports: {}
}

let tasks = [];


module.exports = {
	module: require('./reports.js'),
	name: 'reports',
	permissions: [],
	tasks: tasks,
	exposed: true,
	events: {
		group: 'reports',
		shorthands: events.reports
	}
};