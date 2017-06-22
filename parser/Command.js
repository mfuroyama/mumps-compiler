'use strict';

var util = require('util');
var _ = require('lodash');

const COMMAND_ABBREVIATION_MAP = {
    S: 'SET',
};

const COMMAND_OBJECT_MAP = {
    SET: {
        command: 'SET',
        declarations: [],
        parse: function(chunks, index) {
            const tokens = chunks[index].tokens;

            let tokenIndex = 0;
            while (tokenIndex < tokens.length) {
                let token = tokens[tokenIndex++];

                if (token.type === 'Literal') {
                    const id = token.value;
                    tokenIndex++;
                    token = tokens[tokenIndex++];

                    const init = token.value;
                    this.declarations.push({ id, init });
                } else if (token.value === '(') {
                    while (tokenIndex < tokens.length && token.value !== ')') {
                        if (token.type === 'Literal') {
                            this.declarations.push({ id: token.value });
                        }
                        token = tokens[tokenIndex++];
                    }
                    tokenIndex++;
                    token = tokens[tokenIndex++];
                    this.declarations.forEach((declaration) => {
                        _.extend(declaration, { init: token.value });
                    });
                } else {
                    tokenIndex++;
                }
            }
            return index + 1;
        },
    }
};

const UNKNOWN_OBJECT = {
    command: 'UNKNOWN',
    parse: (chunks, index) => {
        return index + 1;
    }
};

class Command {
    constructor(token) {
        const value = token.value || 'UNKNOWN';
        const command = COMMAND_ABBREVIATION_MAP[value] || value;
        const commandObject = COMMAND_OBJECT_MAP[command] || UNKNOWN_OBJECT;
        _.extend(this, { type: 'Command' }, _.cloneDeep(commandObject));
    }


    static create(chunk) {
        const tokens = chunk.tokens;
        const command = new Command(tokens[0] || 'UNKNOWN');


        return command;
    }
}

module.exports = Command;
