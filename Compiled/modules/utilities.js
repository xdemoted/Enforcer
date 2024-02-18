"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNameCard = exports.generateEquation = exports.defaulter = exports.isEven = exports.isOdd = exports.algGen = exports.stringMax = exports.numberedStringArray = exports.numberedStringArraySingle = exports.random = exports.multiples = exports.isSqrt = exports.getRandomObject = exports.maps = void 0;
const canvas_1 = require("canvas");
var quantize = require('quantize');
const startChance = 0.01;
exports.maps = {
    easy: new Map().set('recompose', 0.5).set('factorize', 0.05).set('divide', 0.05).set('exponentiate', 0.1).set('root', 0.1).set('maxDivision', 3).set('termIntCap', 10).set('maxDepth', 2).set('termLimit', 1),
    medium: new Map().set('recompose', 0.15).set('factorize', 0.1).set('divide', 0.2).set('exponentiate', 0.2).set('root', 0.2).set('maxDivision', 7).set('termIntCap', 25).set('maxDepth', 3).set('termLimit', 1),
    hard: new Map().set('recompose', 0.1).set('factorize', 0.2).set('divide', 0.2).set('exponentiate', 0.3).set('root', 0.3).set('maxDivision', 15).set('termIntCap', 50).set('maxDepth', 4).set('termLimit', 1)
};
function getRandomObject(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
exports.getRandomObject = getRandomObject;
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
    if (min > max)
        return min;
    return Math.round(Math.random() * (max - min)) + min;
}
exports.random = random;
function numberedStringArraySingle(item, index) {
    let strings = ["🥇 ", "🥈 ", "🥉 "];
    if (strings[index])
        return `${strings[index]}${item}`;
    else
        return `${index + 1}th. ${item}`;
}
exports.numberedStringArraySingle = numberedStringArraySingle;
function numberedStringArray(array) {
    let newArray = [];
    let strings = ["🥇 ", "🥈 ", "🥉 "];
    array.forEach((item, index) => {
        newArray.push(numberedStringArraySingle(item, index));
    });
    return newArray;
}
exports.numberedStringArray = numberedStringArray;
function stringMax(str, max) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
exports.stringMax = stringMax;
let valueMap = { "+": 10, "-": 20, "*": 30, "/": 40 };
function getSign(vm) {
    let value = undefined;
    while (value == undefined) {
        if (Math.random() < vm["+"]) {
            value = ['+', valueMap["+"]];
        }
        else if (Math.random() < vm["-"]) {
            value = ['-', valueMap["-"]];
        }
        else if (Math.random() < vm["*"]) {
            value = ['*', valueMap["*"]];
        }
    }
    return value;
}
function sign(number) {
    return ((number < 0) ? " - " : " + ") + Math.abs(number);
}
function formatter(number) {
    let num = number;
    let string = "";
    if (number < 0) {
        number *= -1;
        string += "-";
    }
    else if (number == 0) {
        return "0";
    }
    if (Math.abs(number) == 1) {
        return string;
    }
    string += number;
    return string;
}
function algGen() {
    const A = random(-100, 100);
    const terms = random(3, 10);
    let randoms = [];
    let string = "";
    let final = 0;
    // xR1 + xR2 + xR3... = AR1 + AR2 + AR3...
    for (let i = 0; i < terms; i++) {
        randoms.push(random(-20, 20));
        let mode = random(1, 2);
        switch (mode) {
            case 1:
                final += randoms[i] * A;
                if (i == terms - 1) {
                    string += ((i == 0 ? randoms[i] : sign(randoms[i])) + "x = " + final);
                }
                else {
                    string += (i == 0 ? randoms[i] : sign(randoms[i])) + "x";
                }
                break;
            case 2:
                let randomMultiple = randoms[i];
                let randomX = random(-3, 3);
                let randomConst = random(-10, 10);
                if (i == 0) {
                    string += `${randomMultiple}(${formatter(randomX) + "x"}${sign(randomConst)})`;
                }
                else {
                    string += `${sign(randomMultiple)}(${formatter(randomX) + "x"}${sign(randomConst)})`;
                }
                final += (randomMultiple * A * randomX) + randomConst * randomMultiple;
                if (i == terms - 1) {
                    string += (" = " + final);
                }
            default:
                break;
        }
    }
    return [string, A];
}
exports.algGen = algGen;
function isOdd(num) {
    return num % 2 == 1;
}
exports.isOdd = isOdd;
function isEven(num) {
    return num % 2 == 0;
}
exports.isEven = isEven;
function defaulter(str, def) {
    if (str == undefined) {
        console.log('value defaulted ' + def);
    }
    return str ? str : def;
}
exports.defaulter = defaulter;
function factors(num) {
    let factors = [];
    for (let i = 2; i <= num / 2 - 1; i++) {
        if (num % i === 0) {
            factors.push(i);
        }
    }
    return factors;
}
function newStack(number, map, limit, depth) {
    return seperateNumber(number, map, limit, depth);
}
function seperateNumber(number, map, limit, depth) {
    if (depth == undefined)
        depth = 0;
    if (limit == undefined)
        limit = 1;
    if (depth > limit)
        return '' + number;
    const chance = startChance * ((1 / startChance) ** (depth / limit));
    let string = '';
    while (string === '') {
        if (number < 12 && Math.random() < defaulter(map.get('root'), 0.1)) {
            string = `(${newStack(number ** 2, map, limit, depth + 1)} ^ 0.5)`;
        }
        else if (number ** 0.5 == Math.floor(number ** 0.5) && Math.random() < defaulter(map.get('exponentiate'), 0.1)) {
            string = `(${newStack(number ** 0.5, map, limit, depth + 1)} ^ 2)`;
        }
        if (Math.random() < chance) {
            string = `${number}`;
        }
        else if (Math.random() < defaulter(map.get('factorize'), 0.1)) {
            const numFactors = factors(number);
            if (numFactors.length > 0) {
                const factor = numFactors[random(0, numFactors.length - 1)];
                string = `(${newStack(factor, map, limit, depth + 1)} * ${newStack(number / factor, map, limit, depth + 1)})`;
            }
        }
        else if (Math.random() < defaulter(map.get('divide'), 0.1)) {
            const modifier = random(1, 3);
            string = `(${newStack(modifier * number, map, limit, depth + 1)} / ${newStack(modifier, map, limit, depth + 1)})`;
        }
        else if (Math.random() < defaulter(map.get('recompose'), 0.1)) {
            const modifier = random(1, 100);
            const operation = random(1, 2);
            string = `(${newStack((operation == 1) ? number + modifier : number - modifier, map, limit, depth + 1)} ${operation == 1 ? '-' : '+'} ${newStack(modifier, map, limit, depth + 1)})`;
        }
    }
    //@ts-ignore
    return string;
}
function generateEquation(map) {
    if (map == undefined)
        map = new Map();
    let startNum = random(1, defaulter(map.get('termIntCap'), 100));
    let string = `${seperateNumber(startNum, map, defaulter(map.get('maxDepth'), 5))}`;
    const terms = random(3, defaulter(map.get('termLimit'), 5));
    let finalSolution = startNum;
    for (let i = 0; i < terms; i++) {
        let term = random(1, 50);
        if (Math.random() < 0.5) {
            string += ` + ${seperateNumber(term, map, defaulter(map.get('maxDepth'), 5))}`;
            finalSolution += term;
        }
        else {
            string += ` - ${seperateNumber(term, map, defaulter(map.get('maxDepth'), 5))}`;
            finalSolution -= term;
        }
    }
    return [string, finalSolution];
}
exports.generateEquation = generateEquation;
function createBackgroundImage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.fillRect(325, 200, 700, 50);
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-out';
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(1050, 0);
        ctx.arc(1050, 150, 150, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(150, 300);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-in';
        let image = yield (0, canvas_1.loadImage)(url);
        let height = Math.round((image.height / image.width) * 1200);
        console.log(height);
        ctx.drawImage(yield (0, canvas_1.loadImage)(url), 0, -(height - 300) / 2, 1200, height);
        return canvas;
    });
}
function createTemplate(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        let palette = yield getPalette(url);
        let gradient = ctx.createLinearGradient(0, 0, 1200, 0);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(1, palette[1]);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        let offset = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(150, 0 + offset);
        ctx.lineTo(1050, 0 + offset);
        ctx.arc(1050, 150, 150 - offset, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(150, 300 - offset);
        ctx.arc(150, 150, 150 - offset, Math.PI / 2, Math.PI * 5 / 2);
        ctx.stroke();
        ctx.lineWidth = 10;
        offset = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(350, 200 - offset);
        ctx.lineTo(1000, 200 - offset);
        ctx.arc(1000, 225, 25 + offset, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(350, 250 + offset);
        ctx.arc(350, 225, 25 + offset, Math.PI / 2, -Math.PI / 2);
        ctx.stroke();
        return canvas;
    });
}
function createNameCard(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, canvas_1.loadImage)(url);
        }
        catch (error) {
            url = "../assets/images/namecards/namecard.png";
        }
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield createBackgroundImage(url), 0, 0, 1200, 300);
        ctx.drawImage(yield createTemplate(url), 0, 0, 1200, 300);
        return canvas;
    });
}
exports.createNameCard = createNameCard;
function getPalette(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const quality = 10;
        let image = (yield (0, canvas_1.loadImage)(url));
        let canvas = new canvas_1.Canvas(image.width, image.height);
        let ctx = canvas.getContext('2d');
        let pixelCount = image.width * image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        let imageData = ctx.getImageData(0, 0, image.width, image.height).data;
        let pixels = [];
        for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
            offset = i * 4;
            r = imageData[offset + 0];
            g = imageData[offset + 1];
            b = imageData[offset + 2];
            a = imageData[offset + 3];
            // If pixel is mostly opaque and not white
            if (typeof a === 'undefined' || a >= 125) {
                if (!(r > 250 && g > 250 && b > 250)) {
                    pixels.push([r, g, b]);
                }
            }
        }
        const cmap = quantize(pixels, 2);
        const palette = cmap ? cmap.palette() : null;
        let colors = [];
        if (palette) {
            for (let i = 0; i < palette.length; i++) {
                colors.push(`rgb( ${palette[i][0]} ${palette[i][1]} ${palette[i][2]} )`);
            }
        }
        return colors;
    });
}
