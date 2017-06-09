'use strict';

const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const Line = require('./Line');
const AbstractSyntaxTree = require('./AbstractSyntaxTree');

class MUMPSCompiler {
    readFile(fileName) {
        return fs.readFileSync(fileName, 'utf8').split('\n');
    }
    compile(fileName) {
        this.lines = this.readFile(fileName);
        this.linesObjects = this.lines.map((line, index) => (new Line(line, index)));
        this.abstractSyntaxTree = new AbstractSyntaxTree(this.linesObjects);
        console.log(util.inspect(this.abstractSyntaxTree, { depth: null, colors: true }));
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