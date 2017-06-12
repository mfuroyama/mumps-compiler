var babel = require('babel-core');
var ast = require('./myast.json');

const res = babel.transformFromAst(ast, null, {});
console.log(res.code);
