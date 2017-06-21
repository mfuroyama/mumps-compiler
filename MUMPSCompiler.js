'use strict';

const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const Tokenizer = require('./tokenizer');
const Parser = require('./parser');

class MUMPSCompiler {
    readFile(fileName) {
        return fs.readFileSync(fileName, 'utf8').split('\n');
    }
    compile(fileName) {
        const rawLines = this.readFile(fileName);

        const tokenizer = new Tokenizer();
        const lines = tokenizer.tokenize(rawLines);

        const parser = new Parser();
        const module = parser.parse(lines);

        // console.log(util.inspect(module, { depth: null, colors: true }));
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