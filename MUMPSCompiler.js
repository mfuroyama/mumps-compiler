'use strict';

const fs = require('fs');
const util = require('util');
const _ = require('lodash');

class MUMPSCompiler {

    constructor() {
        MUMPSCompiler.WHITESPACE = /\s/;
        MUMPSCompiler.NUMBERS = /[0-9]/;
        MUMPSCompiler.LETTERS = /[a-z]/i;
        MUMPSCompiler.COMMENT = ';';
    }

    readFile(fileName) {
        return fs.readFileSync(fileName, 'utf8').split('\n');
    }

    tokenizePart(part, line) {
        const tokens = [];
        if (part.length === 0) {
            tokens.push({
                type: 'INDENT',
                value: ' ',
            });
        }
        let current = 0;
        while (current < part.length) {

            // We're also going to store the `current` character in the `line`.
            let char = part[current];

            // Comment check
            if (char === MUMPSCompiler.COMMENT) {
                tokens.push({
                    type: 'COMMENT',
                    value: part.slice(current),
                });
                current = part.length;
                char = null;
            }
        //
        //     // The first thing we want to check for is an open parenthesis. This will
        //     // later be used for `CallExpression` but for now we only care about the
        //     // character.
        //     //
        //     // We check to see if we have an open parenthesis:
        //     if (char === '(') {
        //
        //         // If we do, we push a new token with the type `paren` and set the value
        //         // to an open parenthesis.
        //         tokens.push({
        //             type: 'paren',
        //             value: '(',
        //         });
        //
        //         // Then we increment `current`
        //         current++;
        //
        //         // And we `continue` onto the next cycle of the loop.
        //         continue;
        //     }
        //
        //     // Next we're going to check for a closing parenthesis. We do the same exact
        //     // thing as before: Check for a closing parenthesis, add a new token,
        //     // increment `current`, and `continue`.
        //     if (char === ')') {
        //         tokens.push({
        //             type: 'paren',
        //             value: ')',
        //         });
        //         current++;
        //         continue;
        //     }
        //
        //     // Moving on, we're now going to check for whitespace. This is interesting
        //     // because we care that whitespace exists to separate characters, but it
        //     // isn't actually important for us to store as a token. We would only throw
        //     // it out later.
        //     //
        //     // So here we're just going to test for existence and if it does exist we're
        //     // going to just `continue` on.
        //     if (MUMPSCompiler.WHITESPACE.test(char)) {
        //         current++;
        //         continue;
        //     }
        //
        //     // The next type of token is a number. This is different than what we have
        //     // seen before because a number could be any number of characters and we
        //     // want to capture the entire sequence of characters as one token.
        //     //
        //     //   (add 123 456)
        //     //        ^^^ ^^^
        //     //        Only two separate tokens
        //     //
        //     // So we start this off when we encounter the first number in a sequence.
        //     if (MUMPSCompiler.NUMBERS.test(char)) {
        //
        //         // We're going to create a `value` string that we are going to push
        //         // characters to.
        //         let value = '';
        //
        //         // Then we're going to loop through each character in the sequence until
        //         // we encounter a character that is not a number, pushing each character
        //         // that is a number to our `value` and incrementing `current` as we go.
        //         while (NUMBERS.test(char)) {
        //         value += char;
        //         char = line[++current];
        //         }
        //
        //         // After that we push our `number` token to the `tokens` array.
        //         tokens.push({ type: 'number', value });
        //
        //         // And we continue on.
        //         continue;
        //     }
        //
        //     // We'll also add support for strings in our language which will be any
        //     // text surrounded by double quotes (").
        //     //
        //     //   (concat "foo" "bar")
        //     //            ^^^   ^^^ string tokens
        //     //
        //     // We'll start by checking for the opening quote:
        //     if (char === '"') {
        //         // Keep a `value` variable for building up our string token.
        //         let value = '';
        //
        //         // We'll skip the opening double quote in our token.
        //         char = line[++current];
        //
        //         // Then we'll iterate through each character until we reach another
        //         // double quote.
        //         while (char !== '"') {
        //             value += char;
        //             char = line[++current];
        //         }
        //
        //         // Skip the closing double quote.
        //         char = line[++current];
        //
        //         // And add our `string` token to the `tokens` array.
        //         tokens.push({ type: 'string', value });
        //
        //         continue;
        //     }
        //
        //     // The last type of token will be a `name` token. This is a sequence of
        //     // letters instead of numbers, that are the names of functions in our lisp
        //     // syntax.
        //     //
        //     //   (add 2 4)
        //     //    ^^^
        //     //    Name token
        //     //
        //     if (MUMPSCompiler.LETTERS.test(char)) {
        //         let value = '';
        //
        //         // Again we're just going to loop through all the letters pushing them to
        //         // a value.
        //         while (MUMPSCompiler.LETTERS.test(char)) {
        //             value += char;
        //             char = line[++current];
        //         }
        //
        //         // And pushing that value as a token with the type `name` and continuing.
        //         tokens.push({ type: 'name', value });
        //
        //         continue;
        //     }
        //
        //     // Finally if we have not matched a character by now, we're going to throw
        //     // an error and completely exit.
            // throw new TypeError('I dont know what this character is: ' + char);
            current = part.length;
        }

        // Then at the end of our `tokenizer` we simply return the tokens array.
        return tokens;
    }

    tokenize(line, index) {
        console.log(`Reading line ${index}`);
        const lineParts = line.split(' ');

        return {
            line: index + 1,
            tokens: _.flatten(lineParts.map(part => this.tokenizePart(part, line))),
        }
    }

    parse() {

    }

    compile(fileName) {
        this.lines = this.readFile(fileName);
        this.tokens = this.lines.map((line, index) => {
            return this.tokenize(line, index);
        });

        console.log(util.inspect(this.tokens, { depth: null, colors: true }));
    }
}

module.exports = MUMPSCompiler;


// We can also just run this script straight-up.
if (require.main === module) {
    const options = {};

    const args = process.argv.slice(2);
    const fileName = args[0] || '';

    const compiler = new MUMPSCompiler();
    compiler.compile(fileName);
}