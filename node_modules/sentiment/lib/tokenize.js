/**
 * Remove special characters and return an array of tokens (words).
 * @param  {string} input Input string
 * @return {array}        Array of tokens
 */
module.exports = function(input) {
    return input
        .toLowerCase()
        .replace(/(http:\/\/[\S]*)/ig, '')
        .replace(/(https:\/\/[\S]*)/ig, '')
        .replace(/[.,\/!$%\^&\*;:{}=_`\"~()]/g, '')
        .replace(/[\s]+/g, ' ')
        .trim()
        .split(' ');
};
