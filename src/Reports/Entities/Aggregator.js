'use strict'
let _ = require('lodash');

function getAggregator(type) {
	return require(`./${type}/Aggregator.js`);
}

let Aggregator = {
	get(type, name) {
		//@NOTE: discover specific first, but later
		let aggregator = _.get(getAggregator(type), name);

		if (aggregator) return aggregator;

		let common_function = _.camelCase('common ' + name);

		return this[common_function]
	},
	commonSum(data_array) {
		return _.reduce(data_array, (s, d) => s + d, 0);
	},
	commonCount(data_array) {
		return data_array.length;
	},
	commonAverage(data_array) {
		return _.reduce(data_array, (s, d) => s + d, 0) / data_array.length;
	}
};


module.exports = Aggregator;
