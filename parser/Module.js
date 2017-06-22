'use strict';

var _ = require('lodash');
var Label = require('./Label');

class Module {
    constructor(lines) {

        _.extend(this, {
            type: 'Module',
            sourceType: 'module',
            lines: lines.filter(line => !_.isEmpty(line.text)),
            labels: [],
            comments: lines.filter(line => line.comment).map(line => line.comment),
        });
    }
    parse() {
        let index = 0;
        let isInLabel = false;
        let currLines = [];

        while (index < this.lines.length) {
            const line = this.lines[index];

            // If this is a label line and the label lines array isn't empty, we create a new Label object
            // add the lines and walk the object to create the MUMPS-based pseudo AST
            if ((line.indentation === 0) && (currLines.length > 0)) {
                this.createLabel(currLines);
                currLines = [];
            }

            currLines.push(line);
            index += 1;
        }

        if (currLines.length > 0) {
            this.createLabel(currLines);
        }
    }
    createLabel(lines) {
        const label = new Label(lines);
        label.parse();
        this.labels.push(label);
    }

    static create(lines) {
        const module = new Module(lines);
        module.parse();

        return module;
    }
}

module.exports = Module;
