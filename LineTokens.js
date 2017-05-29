'use strict';

var _ = require('lodash');

const OPERATOR_REGEX = /^(-|\+|\*{1,2}|\\|\/|#|&|!|_|\?|'*<=*|'*>=*|'*\[|'*\]{1,2}|\(|\)|'*=|'|\${1,2}|\^|,|:|@)/;
const STRING_REGEX = /^("+)/;
const CHARACTER_REGEX = /^([A-Za-z0-9\.%]+)/;
const SPACE_REGEX = /^(\s+)/;

class LineTokens {
    constructor(line, index) {
        this.line = line;
        this.index = index;
        this.tokenize();
    }
    tokenize() {
        // First, pull any existing, valid comment out of the line
        this.findComments();

        // Next with the comment out of the way, determine the current indentation of this line
        this.findIndentation();

        // Split the remainder of the line by whitespace to determine the macro-token groups
        this.createTokenGroups();
    }
    findComments() {
        let index = 0;
        let isString = false;
        while (index < this.line.length) {
            if (this.line[index] === '"') {
                isString = !isString;
            } else if (this.line[index] === ';' && !isString) {
                this.comment = this.line.slice(index + 1).trim();
                this.line = _.trimEnd(this.line.slice(0, index));
                break;
            }
            index += 1;
        }
    }
    findIndentation() {
        this.indentation = 0;
        let index = 0;
        while ((index < this.line.length) && (!/\w/.test(this.line[index]))) {
            if ((this.line[index] === ' ') && (this.indentation < 1)) {
                this.indentation = 1;
            } else if ((this.line[index] === '.') && (this.indentation >= 1)) {
                this.indentation += 1;
            }

            index += 1;
        }
        this.line = ((index < this.line.length) ? this.line.slice(index) : '');
    }
    createChunks(line) {
        // We want to split a line of text by spaces, but we also want to ignore the split if
        // those spaces are caught in-between quotation marks. So we implement our own special
        // split function that handles quote-captured spaces. The strategy here is to iterate
        // one character at a time and build substrings as we go, noting the "is string" state
        // as we iterate
        let currLine = line;
        let chunks = [];
        let quoteCount = 0;
        let currChunk = '';

        while (currLine.length > 0) {
            const currChar = currLine[0];
            if (currChar === '"') {
                const quoteMatch = currLine.match(STRING_REGEX);
                const quotes = quoteMatch[0];

                currChunk += quotes;
                quoteCount += quotes.length;
                currLine = currLine.slice(quotes.length);
            }

            // If the current character is a space, then check if we're "in quotes" and capturing
            // spaces. If so, just append, otherwise, add the current substring to the list of
            // chunks, if the string isn't empty.
            else if (currChar === ' ') {
                const spaceMatch = currLine.match(SPACE_REGEX);
                const spaces = spaceMatch[0];

                if (quoteCount % 2 === 0) {
                    chunks.push(currChunk);
                    if (spaces.length > 1) {
                        chunks.push(spaces);
                    }
                    currChunk = '';
                }
                else {
                    currChunk += spaces;
                }

                currLine = currLine.slice(spaces.length);
            }

            else {
                currChunk += currChar;
                currLine = currLine.slice(1);
            }
        }
        if (currChunk !== '') {
            chunks.push(currChunk);
        }
        return chunks;
    }
    createTokenGroups() {
        this.chunks = this.createChunks(this.line);
        // console.log(this.chunks);
        this.tokenGroups = this.chunks.map((chunk) => {
            const tokens = [];
            let currChunk = chunk;

            while (currChunk.length > 0) {
                // Perform a regex match search for valid MUMPS operators.
                const operatorMatch = currChunk.match(OPERATOR_REGEX);
                if (operatorMatch) {
                    const value = operatorMatch[0];
                    tokens.push({
                        value,
                        type: 'OPERATOR',
                    });

                    currChunk = currChunk.slice(value.length);
                }

                // Perform a regex match search for alphanumeric characters at the start of the
                // current string. If we found something, we save the value as either a literal
                // or a number, depending on an 'isNaN' check.
                const charMatch = currChunk.match(CHARACTER_REGEX);
                if (charMatch) {
                    const value = charMatch[0];
                    const type = isNaN(value) ? 'LITERAL' : 'NUMERIC';
                    tokens.push({
                        value,
                        type,
                    });

                    currChunk = currChunk.slice(value.length);
                }

                // Perform a regex match search for MUMPS string literals. The rub here is that
                // literal quotation marks can be represented in a MUMPS string literal by 2
                // consecutive double-quote marks. To mitigate this feature, once we find a group
                // of double-quotes, we capture until we find a matching set (that is, the quote
                // count become even). Then whatever we've captured until then is a string.
                const stringMatch = currChunk.match(STRING_REGEX);
                if (stringMatch) {
                    let value = stringMatch[0];
                    let quoteCount = value.length;
                    currChunk = currChunk.slice(value.length);

                    while (quoteCount % 2 !== 0) {
                        if (currChunk.length === 0) {
                            throw new Error(`Mismatched string error, line ${this.index}: ${chunk}`);
                        }

                        const endStringMatch = currChunk.match(STRING_REGEX);
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
                        value,
                        type: 'STRING',
                    })
                }

                const spaceMatch = (currChunk[0] === ' ');
                if (spaceMatch) {
                    tokens.push({
                        value: '',
                        type: 'SEPARATOR',
                    });
                    currChunk = '';
                }

                if (!operatorMatch && !stringMatch && !charMatch && !spaceMatch) {
                    throw new Error(`Invalid syntax error, line ${this.index}: ${this.line} ${JSON.stringify(tokens)}`);
                }
            }
            return tokens;
        });
    }
}

module.exports = LineTokens;
