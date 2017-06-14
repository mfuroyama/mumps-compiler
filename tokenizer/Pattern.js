module.exports = {
    OPERATOR_REGEX: /^(-|\+|\*{1,2}|\\|\/|#|&|!|_|\?|'*<=*|'*>=*|'*\[|'*\]{1,2}|\(|\)|'*=|'|\${1,2}|\^|,|:|@)/,
    STRING_REGEX: /^("+)/,
    CHARACTER_REGEX: /^([A-Za-z0-9\.%]+)/,
    SPACE_REGEX: /^(\s+)/,
}
    