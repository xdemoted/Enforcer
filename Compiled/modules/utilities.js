"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringMax = exports.random = exports.multiples = exports.isSqrt = exports.getRandomNumber = exports.getRandomObject = void 0;
function getRandomObject(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
exports.getRandomObject = getRandomObject;
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomNumber = getRandomNumber;
function isSqrt(value) {
    return ((value ** 0.5) == Math.floor(value ** 0.5) ? true : false);
}
exports.isSqrt = isSqrt;
function multiples(num) {
    let multiples = [];
    for (let i = 0; i < num; i++) {
        const result = num / i;
        if ((result - Math.floor(result) == 0)) {
            multiples.push(result);
        }
    }
    return multiples;
}
exports.multiples = multiples;
function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}
exports.random = random;
function stringMax(str, max) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
exports.stringMax = stringMax;
