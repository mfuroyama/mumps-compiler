'use strict';

const OPERATOR_REGEX = /^(-|\+|\*{1,2}|\\|\/|#|&|!|_|\?|'*<=*|'*>=*|'*\[|'*\]{1,2}|\(|\)|'*=|'|\${1,2}|\^|,|:)/;
const STRING_REGEX = /^("+)/;
const CHARACTER_REGEX = /^([A-Za-z0-9\.]+)/;

class AbstractSyntaxTree {
    constructor(tokens) {
        this.tokens = tokens;
        this.generate();
    }
    generate() {
    }
}

module.exports = AbstractSyntaxTree;
