"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEquation = exports.defaulter = exports.isEven = exports.isOdd = exports.algGen = exports.generateOldEquation = exports.impossibleVM = exports.hardVM = exports.medVM = exports.easyVM = exports.stringMax = exports.numberedStringArray = exports.numberedStringArraySingle = exports.random = exports.multiples = exports.isSqrt = exports.getRandomObject = exports.map = void 0;
var startChance = 0.01;
exports.map = { easy: new Map().set('recompose', 0.3).set('factorize', 0.1).set('divide', 0.1).set('exponentiate', 0.1).set('root', 0.1).set('termIntCap', 10).set('maxDepth', 2).set('termLimit', 5),
    medium: new Map().set('recompose', 0.15).set('factorize', 0.1).set('divide', 0.2).set('exponentiate', 0.2).set('root', 0.2).set('termIntCap', 50).set('maxDepth', 3).set('termLimit', 7),
    hard: new Map().set('recompose', 0.1).set('factorize', 0.2).set('divide', 0.2).set('exponentiate', 0.3).set('root', 0.3).set('termIntCap', 100).set('maxDepth', 4).set('termLimit', 9)
};
function getRandomObject(array) {
    var randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
exports.getRandomObject = getRandomObject;
function isSqrt(value) {
    return ((Math.pow(value, 0.5)) == Math.floor(Math.pow(value, 0.5)) ? true : false);
}
exports.isSqrt = isSqrt;
function multiples(num) {
    var multiples = [];
    for (var i = 0; i < num; i++) {
        var result = num / i;
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
    var strings = ["🥇 ", "🥈 ", "🥉 "];
    if (strings[index])
        return "".concat(strings[index]).concat(item);
    else
        return "".concat(index + 1, "th. ").concat(item);
}
exports.numberedStringArraySingle = numberedStringArraySingle;
function numberedStringArray(array) {
    var newArray = [];
    var strings = ["🥇 ", "🥈 ", "🥉 "];
    array.forEach(function (item, index) {
        newArray.push(numberedStringArraySingle(item, index));
    });
    return newArray;
}
exports.numberedStringArray = numberedStringArray;
function stringMax(str, max) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
exports.stringMax = stringMax;
var valueMap = { "+": 10, "-": 20, "*": 30, "/": 40 };
function getSign(vm) {
    var value = undefined;
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
exports.easyVM = { "*": .05, "-": .475, "+": 0.475 };
exports.medVM = { "*": .3, "-": .3, "+": 0.3 };
exports.hardVM = { "*": .3, "-": .3, "+": 0.3 };
exports.impossibleVM = { "*": .1, "-": .5, "+": 0.4 };
function generateOldEquation(vm) {
    var termCount = random(3, 6);
    if (vm == exports.impossibleVM) {
        termCount = random(100, 200);
    }
    else if (vm == exports.hardVM) {
        termCount = random(6, 9);
    }
    var terms = [];
    var tAvg = 0;
    var signValue = 0;
    for (var i = 0; i < termCount; i++) {
        var term = random(3, 50);
        terms.push(term);
        tAvg = tAvg + term;
    }
    tAvg = Math.round(tAvg / termCount);
    if (random(0, 1) == 1) {
        var tindex = random(0, terms.length - 1);
        var term = terms[tindex];
        var multipleArray = multiples(term);
        if (multipleArray.length > 1) {
            var multiple = 0;
            while (multiple == term || multiple == 0) {
                multiple = multipleArray[random(0, multipleArray.length - 1)];
            }
            term = "(".concat(term, " / ").concat(multiple, ")");
            terms[tindex] = term;
        }
        signValue = 40;
    }
    for (var i = 0; i < 3; i++) {
        var randTerm = random(0, terms.length - 1);
        if (typeof terms[randTerm] == 'number' || (typeof terms[randTerm] == 'string' && !terms[randTerm].includes('^'))) {
            var term = typeof terms[randTerm] == 'string' ? eval(terms[randTerm]) : terms[randTerm];
            if (isSqrt(term)) {
                terms[randTerm] = "".concat(terms[randTerm], "^0.5");
                signValue = signValue + 30;
            }
            else if (term <= 10) {
                terms[randTerm] = "".concat(terms[randTerm], "^2");
                signValue = signValue + 30;
            }
        }
        else {
            i--;
        }
    }
    var equation = '';
    for (var i = 0; i < terms.length - 1; i++) {
        var term = terms[i];
        var values = getSign(vm);
        signValue = signValue + values[1];
        equation = equation + "".concat(term, " ").concat(values[0], " ");
    }
    equation = equation + terms[terms.length - 1];
    return [equation, eval(equation.replace(/\^/g, '**'))];
}
exports.generateOldEquation = generateOldEquation;
function sign(number) {
    return ((number < 0) ? " - " : " + ") + Math.abs(number);
}
function formatter(number) {
    var num = number;
    var string = "";
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
    var A = random(-100, 100);
    var terms = random(3, 10);
    var randoms = [];
    var string = "";
    var final = 0;
    // xR1 + xR2 + xR3... = AR1 + AR2 + AR3...
    for (var i = 0; i < terms; i++) {
        randoms.push(random(-20, 20));
        var mode = random(1, 2);
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
                var randomMultiple = randoms[i];
                var randomX = random(-3, 3);
                var randomConst = random(-10, 10);
                if (i == 0) {
                    string += "".concat(randomMultiple, "(").concat(formatter(randomX) + "x").concat(sign(randomConst), ")");
                }
                else {
                    string += "".concat(sign(randomMultiple), "(").concat(formatter(randomX) + "x").concat(sign(randomConst), ")");
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
    var factors = [];
    for (var i = 2; i <= num - 1; i++) {
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
    var chance = startChance * (Math.pow((1 / startChance), (depth / limit)));
    var string = '';
    while (string === '') {
        if (number < 12 && Math.random() < defaulter(map.get('root'), 0.1)) {
            string = "(".concat(newStack(Math.pow(number, 2), map, limit, depth + 1), " ^ 0.5)");
        }
        else if (Math.pow(number, 0.5) == Math.floor(Math.pow(number, 0.5)) && Math.random() < defaulter(map.get('exponentiate'), 0.1)) {
            string = "(".concat(newStack(Math.pow(number, 0.5), map, limit, depth + 1), " ^ 2)");
        }
        if (Math.random() < chance) {
            string = "".concat(number);
        }
        else if (Math.random() < defaulter(map.get('factorize'), 0.1)) {
            var numFactors = factors(number);
            if (numFactors.length > 0) {
                var factor = numFactors[random(0, numFactors.length - 1)];
                string = "(".concat(newStack(factor, map, limit, depth + 1), " * ").concat(newStack(number / factor, map, limit, depth + 1), ")");
            }
        }
        else if (Math.random() < defaulter(map.get('divide'), 0.1)) {
            var modifier = random(1, 3);
            string = "(".concat(newStack(modifier * number, map, limit, depth + 1), " / ").concat(newStack(modifier, map, limit, depth + 1), ")");
        }
        else if (Math.random() < defaulter(map.get('recompose'), 0.1)) {
            var modifier = random(1, 100);
            var operation = random(1, 2);
            string = "(".concat(newStack((operation == 1) ? number + modifier : number - modifier, map, limit, depth + 1), " ").concat(operation == 1 ? '-' : '+', " ").concat(newStack(modifier, map, limit, depth + 1), ")");
        }
    }
    //@ts-ignore
    return string;
}
function generateEquation(map) {
    if (map == undefined)
        map = new Map();
    var startNum = random(1, defaulter(map.get('termIntCap'), 100));
    var string = "".concat(seperateNumber(startNum, map, defaulter(map.get('maxDepth'), 5)));
    var terms = random(3, defaulter(map.get('termLimit'), 5));
    var finalSolution = startNum;
    for (var i = 0; i < terms; i++) {
        var term = random(1, 50);
        if (Math.random() < 0.5) {
            string += " + ".concat(seperateNumber(term, map, defaulter(map.get('maxDepth'), 5)));
            finalSolution += term;
        }
        else {
            string += " - ".concat(seperateNumber(term, map, defaulter(map.get('maxDepth'), 5)));
            finalSolution -= term;
        }
    }
    return [string, finalSolution];
}
exports.generateEquation = generateEquation;
