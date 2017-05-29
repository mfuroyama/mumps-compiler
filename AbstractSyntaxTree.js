'use strict';

class AbstractSyntaxTree {
    constructor(tokens) {
        this.tokens = tokens;
        this.generate();
    }
    generate() {
    }
}

module.exports = AbstractSyntaxTree;
