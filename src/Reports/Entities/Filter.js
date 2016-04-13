'use strict'

// let sequence = function (fns) {
// 	return (result) => _.reduce(fns, (a, f) => f.call(this, a), result);
// };

const operations = ['===', '<=', '>=', '!=', '=', '<', '>', 'in'];

let composer = function (fns) {
	this.fns = fns;
};

composer.prototype.filter = function (d) {
	return _.reduce(this.fns, (a, f) => a = a && f(d), true)
};

let Filter = {
	compose(type, names) {
		let filters_functions = _.map(names, desc => this.isCondition(desc) ? this.parse(desc) : this.discover(entity, desc));

		return (d) => _.reduce(filters_functions, (a, f) => a = a && f(d), true);
	},
	discover(type, name) {},
	isCondition(desc) {
		let result = false;
		_.forEach(operations, op => {
			if (!~desc.indexOf(op)) return true;
			result = true;
			return false;
		});

		return result;
	},
	parse(condition) {
		let operation = 'nope';
		let fn;
		_.forEach(operations, op => {
			if (~condition.indexOf(op)) {
				operation = op;
				return false;
			}
		});

		let {
			field,
			value
		} = this.extractFieldAndValue(operation, condition);

		console.log(operation, field, value);

		switch (operation) {
		case '=':
			fn = (x) => x[field] == value;
			break;
		case '===':
			fn = (x) => x[field] === value;
			break;
		case '>':
			fn = (x) => x[field] > value;
			break;
		case '<':
			fn = (x) => x[field] < value;
			break;
		case '<=':
			fn = (x) => x[field] <= value;
			break;
		case '>=':
			fn = (x) => x[field] >= value;
			break;
		case '!=':
			fn = (x) => x[field] != value;
			break;
		case 'in':
			fn = (x) => !!~value.indexOf(x[field]);
			break;
		default:
			throw new Error(`Unknown operation ${operation}`);
		}
		return fn;
	},
	extractFieldAndValue(operation, condition) {
		let parts = condition.split(operation);
		return {
			field: _.trim(parts[0]),
			value: _.trim(parts[1])
		};
	}
};

module.exports = Filter;