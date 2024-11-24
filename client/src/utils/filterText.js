/**
 * This utility file contains functions for handling text processing, specifically dealing with tilde (~) characters.
 * These functions are primarily used for processing Hebrew text and managing quotation marks.
 */


function replaceTildeWithQuote(text) {
  return text.replace(/~/g, '"');
}

function removeTilde(text) {
  return text.replace(/~/g, "");
}

function replaceTildesAlgorithm(text) {
  const cleanText = text.replace(/[^א-ת.:,'`()\/\-\s~]/g, '');

    return cleanText
        .replace(/([א-ת])~([א-ת])/g, '$1"$2')  // replace ~ with " and preserve space
        .replace(/\(([א-ת])~([א-ת])\)/g, '($1"$2)') // replace ~ with " inside parentheses
        .replace(/~\s/g, ' ')                         // remove ~ followed by space
        .replace(/~/g, ' ');                         // replace remaining ~ with space
}

export { replaceTildeWithQuote, removeTilde, replaceTildesAlgorithm };