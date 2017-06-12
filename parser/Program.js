'use strict';

var _ = require('lodash');

class Program {
    static create(tokens) {
        return {
            type: 'Program',
            sourceType: 'module',
            body: Program.walk(tokens),
        }
    }

    static walk(tokens) {
        return [];
    }
}

module.exports = Program;
