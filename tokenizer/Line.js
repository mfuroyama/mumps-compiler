'use strict';

var _ = require('lodash');
var util = require('util');
var Chunk = require('./Chunk');
var Pattern = require('./Pattern');

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
        console.log(util.inspect(this, { depth: null, colors: true }));
    }
    getTokens() {
        return _.flatten(this.chunks.map(chunk => chunk.tokens));
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
                const quoteMatch = currLine.match(Pattern.STRING_REGEX);
                const quotes = quoteMatch[0];

                currChunk += quotes;
                quoteCount += quotes.length;
                currLine = currLine.slice(quotes.length);
            }

            // If the current character is a space, then check if we're "in quotes" and capturing
            // spaces. If so, just append, otherwise, add the current substring to the list of
            // chunks, if the string isn't empty.
            else if (currChar === ' ') {
                const spaceMatch = currLine.match(Pattern.SPACE_REGEX);
                const spaces = spaceMatch[0];

                if (quoteCount % 2 === 0) {
                    chunks.push(new Chunk(currChunk, {
                        row: this.row,
                        column: index,
                        level: this.indentation,
                    }));
                    index += (currChunk.length + 1);

                    if (spaces.length > 1) {
                        chunks.push(new Chunk(spaces, {
                            row: this.row,
                            column: index,
                            level: this.indentation,
                        }));
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
            chunks.push(new Chunk(currChunk, {
                row: this.row,
                column: index,
                level: this.indentation,
            }));
            index += (currChunk.length + 1);
        }

        return chunks;
    }
}

module.exports = Line;
