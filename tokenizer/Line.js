'use strict';

var _ = require('lodash');

const OPERATOR_REGEX = /^(-|\+|\*{1,2}|\\|\/|#|&|!|_|\?|'*<=*|'*>=*|'*\[|'*\]{1,2}|\(|\)|'*=|'|\${1,2}|\^|,|:|@)/;
const STRING_REGEX = /^("+)/;
const CHARACTER_REGEX = /^([A-Za-z0-9\.%]+)/;
const SPACE_REGEX = /^(\s+)/;

class Line {
    constructor(line, index) {
        this.text = line;
        this.row = index;

        // First, pull any existing, valid comment out of the line
        this.findComments();

        // Next with the comment out of the way, determine the current indentation of this line
        this.findIndentation();

        // Split the remainder of the line by whitespace to determine the macro-token groups
        this.tokenize();
    }
    findComments() {
        let index = 0;

        // A comment is marked in MUMPS by a semicolon. We want to make sure, though, that
        // when we look for comments, we're not including semicolons contained within strings.
        let isString = false;
        while (index < this.text.length) {
            if (this.text[index] === '"') {
                isString = !isString;
            } else if (this.text[index] === ';' && !isString) {
                this.comment = {
                    type: 'Comment',
                    row: this.row,
                    column: index,
                    text: this.text.slice(index + 1).trim()
                }
                this.text = _.trimEnd(this.text.slice(0, index));
                break;
            }
            index += 1;
        }
    }
    findIndentation() {
        this.column = 0;
        this.indentation = 0;

        let index = 0;
        while ((index < this.text.length) && (!/\w/.test(this.text[index]))) {
            if ((this.text[index] === ' ') && (this.indentation < 1)) {
                this.indentation = 1;
            } else if ((this.text[index] === '.') && (this.indentation >= 1)) {
                this.indentation += 1;
            }

            index += 1;
        }
        this.text = ((index < this.text.length) ? this.text.slice(index) : '');
        this.column = index;
    }
    tokenize() {
        this.chunks = this.createChunks();
        this.tokens = _.flatten(this.chunks.map(this.createTokens.bind(this)));
    }
    createChunks() {
        // We want to split a line of text by spaces, but we also want to ignore the split if
        // those spaces are caught in-between quotation marks. So we implement our own special
        // split function that handles quote-captured spaces. The strategy here is to iterate
        // one character at a time and build substrings as we go, noting the "is string" state
        // as we iterate
        let currLine = this.text;
        let chunks = [];
        let quoteCount = 0;
        let currChunk = '';
        let index = this.column;

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
                    chunks.push({
                        value: currChunk,
                        row: this.row,
                        column: index,
                    });
                    index += (currChunk.length + 1);

                    if (spaces.length > 1) {
                        chunks.push({
                            value: spaces,
                            row: this.row,
                            column: index,
                        });
                        index += (spaces.length + 1);
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
            chunks.push({
                value: currChunk,
                row: this.row,
                column: index,
            });
            index += (currChunk.length + 1);
        }
        return chunks;
    }
    createTokens(chunk) {
        const tokens = [];
        let currChunk = chunk.value;
        let column = chunk.column;

        while (currChunk.length > 0) {
            // Perform a regex match search for valid MUMPS operators.
            const operatorMatch = currChunk.match(OPERATOR_REGEX);
            if (operatorMatch) {
                const value = operatorMatch[0];
                tokens.push({
                    type: 'Operator',
                    value,
                    row: this.row,
                    column,
                    level: this.indentation,
                });

                currChunk = currChunk.slice(value.length);
                column += value.length;
            }

            // Perform a regex match search for alphanumeric characters at the start of the
            // current string. If we found something, we save the value as either a literal
            // or a number, depending on an 'isNaN' check.
            const charMatch = currChunk.match(CHARACTER_REGEX);
            if (charMatch) {
                const value = charMatch[0];
                const type = isNaN(value) ? 'Literal' : 'Numeric';
                tokens.push({
                    type,
                    value,
                    row: this.row,
                    column,
                    level: this.indentation,
                });

                currChunk = currChunk.slice(value.length);
                column += value.length;
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
                        throw new Error(`Mismatched string error, line ${this.row}: ${chunk}`);
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
                    type: 'String',
                    value: value.slice(1, -1),
                    row: this.row,
                    column,
                    level: this.indentation,
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
                    level: this.indentation,
                });
                currChunk = '';
                column++;
            }

            if (!operatorMatch && !stringMatch && !charMatch && !spaceMatch) {
                throw new Error(`Invalid syntax error, line ${this.row}: ${this.text} ${JSON.stringify(tokens)}`);
            }
        }
        return tokens;
    }
}

module.exports = Line;
