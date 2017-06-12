'use strict';

var _ = require('lodash');
var Line = require('./Line');

class Tokenizer {
    tokenize(rawLines) {
        return rawLines.map((line, index) => (new Line(line, index)));
    }
}

module.exports = Tokenizer;
