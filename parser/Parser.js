'use strict';

var _ = require('lodash');

class Parser {
    parse(lines) {
        this.lines = lines;
        this.comments = this.lines.filter(line => line.comment).map(line => line.comment);
        this.tokens = _.flatten([].concat(this.lines.map(line => line.tokens)));

        // From there, recursively create the syntax trees from the grouped line tokens.
        // this.createRoutines();

        return this.createProgram();
    }

    createProgram() {
        return {};
    }

    walk(tokens) {

    }
}

module.exports = Parser;
