'use strict';

var _ = require('lodash');
var Program = require('./Program');

class Parser {
    parse(lines) {
        const tokens = _.flatten([].concat(lines.map(line => line.getTokens())));
        return {
            type: 'File',
            program: this.createProgram(tokens),
            comments: lines.filter(line => line.comment).map(line => line.comment),
            tokens,
        };
    }

    createProgram(tokens) {
        return Program.create(tokens);
    }
}

module.exports = Parser;
