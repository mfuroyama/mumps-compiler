'use strict';

var _ = require('lodash');
var Pattern = require('./Pattern');

class Chunk {
    constructor(value, options) {
        this.value = value;
        this.row = options.row;
        this.column = options.column;
        this.level = options.level;
        this.tokens = this.createTokens(value);
    }
    createTokens(value) {
        const tokens = [];
        let currChunk = this.value;
        let column = this.column;

        while (currChunk.length > 0) {
            // Perform a regex match search for valid MUMPS operators.
            const operatorMatch = currChunk.match(Pattern.OPERATOR_REGEX);
            if (operatorMatch) {
                const value = operatorMatch[0];
                tokens.push({
                    type: 'Operator',
                    value,
                    row: this.row,
                    column,
                    level: this.level,
                });

                currChunk = currChunk.slice(value.length);
                column += value.length;
            }

            // Perform a regex match search for alphanumeric characters at the start of the
            // current string. If we found something, we save the value as either a literal
            // or a number, depending on an 'isNaN' check.
            const charMatch = currChunk.match(Pattern.CHARACTER_REGEX);
            if (charMatch) {
                const value = charMatch[0];
                const type = isNaN(value) ? 'Literal' : 'Numeric';
                tokens.push({
                    type,
                    value,
                    row: this.row,
                    column,
                    level: this.level,
                });

                currChunk = currChunk.slice(value.length);
                column += value.length;
            }

            // Perform a regex match search for MUMPS string literals. The rub here is that
            // literal quotation marks can be represented in a MUMPS string literal by 2
            // consecutive double-quote marks. To mitigate this feature, once we find a group
            // of double-quotes, we capture until we find a matching set (that is, the quote
            // count become even). Then whatever we've captured until then is a string.
            const stringMatch = currChunk.match(Pattern.STRING_REGEX);
            if (stringMatch) {
                let value = stringMatch[0];
                let quoteCount = value.length;
                currChunk = currChunk.slice(value.length);

                while (quoteCount % 2 !== 0) {
                    if (currChunk.length === 0) {
                        throw new Error(`Mismatched string error, line ${this.row}: ${chunk}`);
                    }

                    const endStringMatch = currChunk.match(Pattern.STRING_REGEX);
                    if (endStringMatch) {
                        const endValue = endStringMatch[0];
                        quoteCount += endValue.length;
                        value += endValue;
                        currChunk = currChunk.slice(endValue.length);
                    }
                    else {
                        value += currChunk[0];
                        currChunk = currChunk.slice(1);
                    }
                }

                tokens.push({
                    type: 'String',
                    value: value.slice(1, -1),
                    row: this.row,
                    column,
                    level: this.level,
                })
                column += value.length;
            }

            const spaceMatch = (currChunk[0] === ' ');
            if (spaceMatch) {
                tokens.push({
                    type: 'Separator',
                    value: '',
                    row: this.row,
                    column,
                    level: this.level,
                });
                currChunk = '';
                column++;
            }

            if (!operatorMatch && !stringMatch && !charMatch && !spaceMatch) {
                throw new Error(`Invalid syntax error`);
            }
        }
        return tokens;
    }
}

module.exports = Chunk;
