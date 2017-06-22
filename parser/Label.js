'use strict';

var util = require('util');
var _ = require('lodash');
var Command = require('./Command');

class Label {
    constructor(lines) {
        this.chunks = lines.reduce((chunks, line) => (chunks.concat(line.chunks)), []);
        this.params = [];
        this.body = [];
    }
    parse() {
        this.parseFirst();

        let index = 1;
        while (index < this.chunks.length) {
            index = this.walk(index);
        }
        console.log(util.inspect(this, { depth: null, colors: true }));
    }

    parseFirst() {
        if (this.chunks.length === 0) {
            return;
        }

        const tokens = this.chunks[0].tokens || [];
        if (tokens.length === 0) {
            return;
        }

        let index = 0;
        this.id = _.get(tokens[index++], 'value');

        let isParsingParams = ((_.get(tokens[index++], 'value')) === '(');
        while (isParsingParams && (index < tokens.length)) {
            const token = tokens[index];
            if (token.type === 'Literal') {
                this.params.push(token.value);
            }
            if (token === ')') {
                isParsingParams = false;
            }
            index += 1;
        }
    }

    walk(index) {
        const chunk = this.chunks[index];
        const tokens = chunk.tokens;

        if (tokens.length === 0) {
            return index + 1;
        }

        const command = Command.create(this.chunks[index++]);
        this.body.push(command);

        return command.parse.call(command, this.chunks, index);
    }
}

module.exports = Label;
