'use strict';

var _ = require('lodash');
var Module = require('./Module');

class Parser {
    parse(lines) {
        return Module.create(lines);
    }
}

module.exports = Parser;
