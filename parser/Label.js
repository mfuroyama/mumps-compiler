'use strict';

var _ = require('lodash');

class Label {
    constructor(lines) {
        this.lines = lines;
        this.params = [];
        this.body = [];
    }
    walk() {
        let index = 0;
        while (index < this.lines.length) {
            const line = this.lines[index];
            if (line.indentation === 0) {
                this.parseInitialLine(line);
            }

            this.parseLine(line);
            index += 1;
        }
        console.log(this);
    }
    parseInitialLine(line) {
        // Get the first chunk tokens, then parse the id and params out of there
        const tokens = _.get(line, 'chunks[0].tokens');
        let index = 0;

        this.id = _.get(tokens[index++], 'value', '');

        let isParsingParams = ((_.get(tokens[index++], 'value', '')) === '(');
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
    parseLine(line) {

    }
}

module.exports = Label;
