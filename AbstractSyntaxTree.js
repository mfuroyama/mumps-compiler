'use strict';

var _ = require('lodash');

// Routine
// -> Command
// -> -> Params
// -> -> -> (Function, Global, Expression)

class AbstractSyntaxTree {
    constructor(lines) {
        this.lines = lines;
        this.tokens = [];

        this.initialize();

        // From there, recursively create the syntax trees from the grouped line tokens.
        // this.createRoutines();
    }
    initialize() {
        this.comments = this.lines.filter(line => line.comment).map(line => line.comment);
        this.tokens = _.flatten(this.tokens.concat(this.lines.map(line => line.tokens)));
    }
}

module.exports = AbstractSyntaxTree;
