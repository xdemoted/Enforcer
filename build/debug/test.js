"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const canvas_1 = __importStar(require("canvas"));
var quantize = require('quantize');
const fs = __importStar(require("fs"));
const utilities_1 = require("../modules/utilities");
const data_1 = require("../modules/data");
const crypto_1 = require("crypto");
const gifencoder_1 = __importDefault(require("gifencoder"));
canvas_1.default.registerFont('./build/assets/fonts/segmento.otf', { family: 'Segmento' });
const url = 'https://music.youtube.com/watch?v=6ywXBNpc-To&list=LM';
function createNamecard() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/namecards/namecard.png'), 0, 0, 1200, 300);
        //ctx.globalCompositeOperation = 'source-in';
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'orange';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.drawImage(await loadImage('https://th.bing.com/th?id=OIF.uXkIoa4KAF4OGw6X%2bi3niw&rs=1&pid=ImgDetMain'), 0, 0, 1200, 400)
        // ctx.globalAlpha = 0;
        // ctx.globalCompositeOperation = 'source-over';
        // ctx.drawImage(await loadImage('./Compiled/assets/images/namecards/namecard.png'), 0, 0, 1200, 300)
        fs.writeFileSync('./newcard.png', canvas.toBuffer());
    });
}
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
        console.log(palette);
        let colors = [];
        for (let i = 0; i < palette.length; i++) {
            colors.push(`rgb( ${palette[i][0]} ${palette[i][1]} ${palette[i][2]} )`);
        }
        return colors;
    });
}
function createStatCard(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        let image = yield (0, canvas_1.loadImage)(url);
        let height = Math.round((image.height / image.width) * 1200);
        ctx.drawImage(image, 0, -(height - 300) / 2, 1200, height);
        return canvas;
    });
}
function testCanvas() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1000, 1400);
        let gradient;
        let ctx = canvas.getContext('2d');
        const offset = ((25 ** 2) / 2) ** 0.5;
        let utilCTX = new utilities_1.ContextUtilities(ctx);
        const color = ['#505050', '#646464', '#505050'];
        // Left Boundary
        utilCTX.setGradient(50, 0, 0, 0, color);
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(50, 150 + offset);
        ctx.lineTo(50, 1350);
        ctx.lineTo(0, 1400);
        ctx.fill();
        // Top Boundary
        utilCTX.setGradient(0, 50, 0, 0, color);
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(950, 50);
        ctx.lineTo(150 + offset, 50);
        ctx.fill();
        // Right Boundary
        utilCTX.setGradient(1000, 0, 950, 0, color);
        ctx.beginPath();
        ctx.moveTo(950, 50);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 1250);
        ctx.lineTo(950, 1250 - offset);
        ctx.fill();
        // Diagonal Bottom-right
        utilCTX.setGradient(1000, 1250, 1000 - offset * 2, 1250 - offset * 2, color);
        ctx.beginPath();
        ctx.moveTo(950, 1250 - offset);
        ctx.lineTo(1000, 1250);
        ctx.lineTo(850, 1400);
        ctx.lineTo(850 - offset, 1350);
        ctx.fill();
        // Bottom Boundary
        utilCTX.setGradient(0, 1350, 0, 1400, color);
        ctx.beginPath();
        ctx.moveTo(0, 1400);
        ctx.lineTo(850, 1400);
        ctx.lineTo(850 - offset, 1350);
        ctx.lineTo(50, 1350);
        ctx.fill();
        // Diagonal Top-left
        ctx.lineWidth = 5;
        gradient = ctx.createLinearGradient(0, 150, offset, 150 + offset);
        gradient.addColorStop(1, '#646464');
        gradient.addColorStop(0, '#505050');
        ctx.fillStyle = gradient;
        utilCTX.angledRect(0, 150, 150, 0, 25);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fill();
        gradient = ctx.createLinearGradient(offset, 150 + offset, 2 * offset, 150 + 2 * offset);
        gradient.addColorStop(0, '#646464');
        gradient.addColorStop(1, '#505050');
        ctx.fillStyle = gradient;
        utilCTX.angledRect(offset, 150 + offset, 150 + offset, offset, 25);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.moveTo(25, 150 + offset / 2);
        ctx.lineTo(150 + offset, offset);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#646464';
        ctx.stroke();
        utilCTX.starPolygon(8, 50, 300, 40, 10);
        ctx.fill();
        fs.writeFileSync('./test.png', canvas.toBuffer());
    });
}
function testCard() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1000, 1400);
        let ctx = canvas.getContext('2d');
        let util = new utilities_1.ContextUtilities(ctx);
        let star = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/star.png');
        let baseCard = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/threestar.png');
        ctx.drawImage(baseCard, 0, 0, 1000, 1400);
        const offset = ((25 ** 2) / 2) ** 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(150, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 1250);
        ctx.lineTo(850, 1400);
        ctx.lineTo(0, 1400);
        ctx.moveTo(50, 300);
        ctx.lineTo(50, 1350);
        ctx.lineTo(850 - offset, 1350);
        ctx.lineTo(950, 1250 - offset);
        ctx.lineTo(950, 50);
        ctx.lineTo(550, 50);
        ctx.lineTo(550, 150);
        ctx.lineTo(400, 300);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffd800';
        util.starPolygon(10, 150, 150, 50, 20);
        ctx.fill();
        util.starPolygon(10, 265, 150, 50, 20);
        ctx.fill();
        util.starPolygon(10, 380, 150, 50, 20);
        ctx.fill();
        fs.writeFileSync('../testFrame.png', canvas.toBuffer());
    });
}
function autoScaleCardBackground() {
    return __awaiter(this, arguments, void 0, function* (url = data_1.GetFile.assets + '/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = 1, mode = 'h', mark) {
        if (mode == 'h') {
            let image = yield (0, canvas_1.loadImage)(url);
            let scaled = 1400 / image.height * scale;
            return cardBackground(url, translation, [scaled, scaled], mark);
        }
        else {
            let image = yield (0, canvas_1.loadImage)(url);
            let scaled = 1000 / image.width * scale;
            return cardBackground(url, translation, [scaled, scaled], mark);
        }
    });
}
function cardBackground() {
    return __awaiter(this, arguments, void 0, function* (url = data_1.GetFile.assets + '/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = [1, 1], mark) {
        let canvas = new canvas_1.Canvas(1000, 1400);
        let ctx = canvas.getContext('2d');
        let image = yield (0, canvas_1.loadImage)(url);
        let scaled = [image.width * scale[0], image.height * scale[1]];
        ctx.beginPath();
        ctx.moveTo(0, 175);
        ctx.lineTo(175, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 1225);
        ctx.lineTo(825, 1400);
        ctx.lineTo(0, 1400);
        ctx.clip();
        ctx.drawImage(image, 500 - scaled[0] / 2 + translation[0], 700 - scaled[1] / 2 + translation[1], scaled[0], scaled[1]);
        if (mark) {
            ctx.beginPath();
            ctx.moveTo(500, 0);
            ctx.lineTo(500, 1400);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 700);
            ctx.lineTo(1000, 700);
            ctx.stroke();
            for (let i = 0; i < 1000; i += 25) {
                let size = 10;
                if (i % 100 == 0)
                    size = 25;
                ctx.beginPath();
                ctx.moveTo(i, 700 - size);
                ctx.lineTo(i, 700 + size);
                ctx.stroke();
            }
            for (let i = 0; i < 1400; i += 25) {
                let size = 10;
                if (i % 100 == 0)
                    size = 25;
                ctx.beginPath();
                ctx.moveTo(500 - size, i);
                ctx.lineTo(500 + size, i);
                ctx.stroke();
            }
        }
        fs.writeFileSync('../newCard.png', canvas.toBuffer());
        return canvas;
    });
}
function addFrame(source_1, rank_1) {
    return __awaiter(this, arguments, void 0, function* (source, rank, scale = 1) {
        let canvas = new canvas_1.Canvas(1000 * scale, 1400 * scale);
        let ctx = canvas.getContext('2d');
        let sourceImage;
        if (source instanceof canvas_1.Canvas)
            sourceImage = source;
        else {
            try {
                sourceImage = yield (0, canvas_1.loadImage)(source);
            }
            catch (error) {
                sourceImage = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + "/images/tradecards/backgrounds/default.png");
            }
        }
        let frame;
        if (rank == 1 || rank == 2 || rank == 3)
            frame = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + `/images/tradecards/frames/${rank}star.png`);
        else
            frame = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/frames/default.png');
        ctx.drawImage(sourceImage, 0, 0, 1000 * scale, 1400 * scale);
        ctx.drawImage(frame, 0, 0, 1000 * scale, 1400 * scale);
        return canvas;
    });
}
function createCard(source_1, rank_1) {
    return __awaiter(this, arguments, void 0, function* (source, rank, translation = [0, 0], scale = 1, mode = 'h', mark) {
        let canvas = yield autoScaleCardBackground(source, translation, scale, mode, mark);
        fs.writeFileSync('./noframe.png', canvas.toBuffer());
        let frame = yield addFrame(canvas, rank, scale);
        fs.writeFileSync('./withframe.png', frame.toBuffer());
        return frame;
    });
}
function listCards() {
    return __awaiter(this, void 0, void 0, function* () {
        let manifest = require(data_1.GetFile.assets + '/images/tradecards/manifest.json');
        console.log(manifest.cards);
        let resolution = 0.25;
        let canvas = new canvas_1.Canvas(Math.floor((manifest.cards.length - 1) / 6) * 1000 * resolution + 1000 * resolution, 8400 * resolution);
        let context = canvas.getContext('2d');
        for (let i = 0; i < manifest.cards.length; i++) {
            context.drawImage(yield (0, canvas_1.loadImage)((yield addFrame(data_1.GetFile.assets + '/images/tradecards/backgrounds/' + manifest.cards[i].background, manifest.cards[i].rank)).toBuffer()), Math.floor(i / 6) * 1000 * resolution, (i % 6) * 1400 * resolution, 1000 * resolution, 1400 * resolution);
            console.log(i, "/", manifest.cards.length - 1, "done");
        }
        fs.writeFileSync('../cards.png', canvas.toBuffer());
        return canvas;
    });
}
function multiDraw(amount, guarantee = false) {
    let results = [];
    for (let i = 0; i < amount; i++) {
        results.push((0, utilities_1.cardDraw)(guarantee));
    }
    return results;
}
function rollTest() {
    let rolls = multiDraw(10000);
    let fails = 0;
    let ones = 0;
    let twos = 0;
    let threes = 0;
    console.log(rolls.sort((a, b) => { return (a && typeof a.rank == 'number' ? a.rank : 10) - (b && typeof b.rank == 'number' ? b.rank : 10); }));
    for (let i = 0; i < rolls.length; i++) {
        const roll = rolls[i];
        if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 0)
            fails++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 1)
            ones++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 2)
            twos++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 3)
            threes++;
    }
    const total = ones + twos + threes;
    console.log('Failed Rolls:', fails / rolls.length * 100 + '%', `(${fails})`);
    console.log('One Star Rolls:', ones / rolls.length * 100 + '%', `(${ones})`);
    console.log('Two Star Rolls:', twos / rolls.length * 100 + '%', `(${twos})`);
    console.log('Three Star Rolls:', threes / rolls.length * 100 + '%', `(${threes})`);
    console.log('Three Star (Isolated):', Math.round(threes / total * 10000) / 100, '%');
    console.log('Two Star (Isolated):', Math.round(twos / total * 10000) / 100, '%');
    console.log('One Star (Isolated):', Math.round(ones / total * 10000) / 100, '%');
}
//openChestGif()
//createCatalog(0)
//fs.readdir('./assets/images/tradecards/backgrounds', (err, files) => {console.log(files)})
//listCards()
//createCard('https://images.wallpapersden.com/image/download/godzilla_bGtqamqUmZqaraWkpJRmbmdlrWZnZWU.jpg', 3, [50, (1400 * scale - 1400) / 2], scale, 'h', false)
//createCard('../redacted.png', 3, [0, (1400 * scale - 1400) / 2], scale, 'h', false)
// DOVER https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7a4d4f7e-ea30-4b24-a0ba-485be1c26475/d4jvv00-7dbcd70b-140f-4aad-a4d1-8fe381f0b012.jpg/v1/fill/w_900,h_1135,q_75,strp/dover_demon_by_chr_ali3_d4jvv00-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTEzNSIsInBhdGgiOiJcL2ZcLzdhNGQ0ZjdlLWVhMzAtNGIyNC1hMGJhLTQ4NWJlMWMyNjQ3NVwvZDRqdnYwMC03ZGJjZDcwYi0xNDBmLTRhYWQtYTRkMS04ZmUzODFmMGIwMTIuanBnIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.pjzpBDKbg_6pchvx6axCPlS3Z8N8z3ifpwKYU6W0DPA
function modColor(color, modifier) {
    let newColor = color.map((value, _index) => {
        let newValue = value + modifier;
        if (newValue > 255)
            newValue = 255;
        if (newValue < 0)
            newValue = 0;
        return newValue;
    });
    return newColor;
}
function colorEncoder(str) {
    const colorMap = { "&0": [230, 230, 0], "&1": [200, 20, 175], '&2': [52, 152, 219], "&3": [230, 230, 0], "&4": [200, 20, 175], '&5': [52, 152, 219], "&6": [230, 230, 0], "&7": [200, 20, 175], '&8': [52, 152, 219] };
    const regex = /&\d/g;
    const modifiedStr = str.replace(regex, '');
    const parts = str.split(/(&\d)/);
    if (parts[0].length == 0)
        parts.splice(0, 1);
    let length = 0;
    let canvas = new canvas_1.Canvas(1, 1);
    let ctx = canvas.getContext('2d');
    ctx.font = '40px Segmento';
    canvas = new canvas_1.Canvas(ctx.measureText(modifiedStr).width, 50);
    ctx = canvas.getContext('2d');
    ctx.font = '40px Segmento';
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part.startsWith('&')) {
            let color;
            if (parts[i - 1] && parts[i - 1].startsWith('&')) {
                color = colorMap[parts[i - 1]];
            }
            else
                color = [255, 255, 255];
            part.split('').forEach((char, _index) => {
                let symbolColor = color;
                if (/^[a-z0-9]+$/i.test(char)) {
                    symbolColor = modColor(color, -50);
                    ctx.fillStyle = `rgb(${symbolColor[0]},${symbolColor[1]},${symbolColor[2]})`;
                }
                else if (/[+\-/*/^]/.test(char)) {
                    symbolColor = modColor(color, -25);
                    ctx.fillStyle = `rgb(${symbolColor[0]},${symbolColor[1]},${symbolColor[2]})`;
                }
                else {
                    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                }
                ctx.fillText(char, length, 35);
                length += ctx.measureText(char).width;
            });
        }
    }
    return canvas;
}
function createColorText(str) {
    let left = [];
    let right = [];
    let pairs = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') {
            left.push(i);
        }
        else if (str[i] === ')') {
            right.push(i);
            let leftIndex = left.pop();
            pairs.push([typeof leftIndex == 'number' ? leftIndex : -1, i, left.length]);
        }
    }
    let modifiedStr = str.split('').map((char, index) => {
        if (char === '(') {
            let pair = pairs.find(pair => pair[0] === index);
            if (pair) {
                return `\&${pair[2]}(`;
            }
        }
        else if (char === ')') {
            let pair = pairs.find(pair => pair[1] === index);
            if (pair) {
                return `)\&${pair[2] - 1 >= 0 ? pair[2] - 1 : 0}`;
            }
        }
        return char;
    }).join('');
    return colorEncoder(modifiedStr);
}
function multilineText(position, text, ctx, maxWidth = 0, wordBreak = false) {
    let str = '';
    let array;
    if (wordBreak)
        array = text.split(' ');
    else
        array = text.split('');
    let lines = 1;
    console.log(ctx.measureText(text).width);
    console.log(array);
    for (let i = 0; i < array.length; i++) {
        const length = ctx.measureText(str.replace(/\n/g, '') + array[i]).width;
        if (maxWidth > 1 && length > maxWidth * lines) {
            console.log('New line at:', i);
            str += '\n' + array[i];
            lines++;
        }
        else {
            str += array[i];
        }
    }
    let textLines = str.split('\n');
    let lineHeight = ctx.measureText('M').width * 1.5;
    textLines.forEach((line, index) => {
        ctx.fillText(line, position[0], position[1] + lineHeight * index);
    });
}
function measureMultilineText(text, font = 'Arial 20px', maxWidth = 0, wordBreak = false) {
    const originalMaxWidth = maxWidth;
    let charHeight = (0, utilities_1.measureText)('M', font).width * 1.5;
    let lineCount = 1;
    let str = '';
    let lines = [];
    let characters;
    if (wordBreak)
        characters = text.split(' ');
    else
        characters = text.split('');
    if (maxWidth > 1) {
        for (let i = 0; i < characters.length; i++) {
            const length = (0, utilities_1.measureText)(str.replace(/\n/g, '') + characters[i], font).width;
            if (length > maxWidth) {
                lines.push(str);
                lineCount++;
                str = characters[i];
            }
            else {
                if (str == ' ')
                    str = '';
                str += characters[i];
            }
        }
        if (str.length > 0) {
            lines.push(str);
            lineCount++;
        }
    }
    return { lineCount: lineCount, height: charHeight * lineCount, lines: lines };
}
//colorEncoder('Test&2Test&3Test&4Test&5Test&6Test')
createColorText('44+((((4 * 43) / (-25 + 27)) / (44 - (17 + 25))) + ((68 / 2) - (6 * 5))) + ((((6 / 3) * 23) / ((16 ^ 0.5) / (-18 + 20))) / (1 ^ 2))');
// (  (  8  +  5  )  -  (  5  -  6  )  )  +  (  (  5  1  +  2  0  )  -  (  2  2  -  1  0  )  )
// 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
function generateCalculator() {
    const res = 115 / 66;
    const lw = 4 * res;
    let canvas = new canvas_1.Canvas(115, 150);
    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lw;
    let ctxUtils = new utilities_1.ContextUtilities(ctx);
    ctxUtils.roundedRect(0, 0, 66 * res, 86 * res, 5 * res, lw);
    ctx.stroke();
    ctxUtils.roundedRect(8 * res, 8 * res, 50 * res, 16 * res, 5 * res, lw);
    ctx.stroke();
    ctxUtils.roundedRect(8 * res, 28 * res, 14 * res, 14 * res, 3 * res, lw);
    ctx.stroke();
    ctxUtils.roundedRect(26 * res, 28 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(44 * res, 28 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(8 * res, 46 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(26 * res, 46 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(44 * res, 46 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(8 * res, 64 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(26 * res, 64 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    ctxUtils.roundedRect(44 * res, 64 * res, 14 * res, 14 * res, 3 * res, lw * 0.75);
    ctx.stroke();
    return canvas;
}
function circleGenerator() {
    let canvas = new canvas_1.Canvas(250, 250);
    let ctx = canvas.getContext('2d');
    let ctxUtils = new utilities_1.ContextUtilities(ctx);
    ctxUtils.roundedRect(0, 0, 250, 250, 125, 0);
    let gradient = ctx.createRadialGradient(125, 125, 0, 125, 125, 125);
    gradient.addColorStop(0, '#101010');
    gradient.addColorStop(1, '#404040');
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.drawImage(generateCalculator(), 135 / 2, 50, 115, 150);
    fs.writeFileSync('./circle.png', canvas.toBuffer());
}
function textHeight(font) {
    let canvas = new canvas_1.Canvas(100, 100);
    let ctx = canvas.getContext('2d');
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.fillText('Hello World', 0, 0);
    const result = trim(canvas);
    fs.writeFileSync('./test.png', canvas.toBuffer());
    return result ? result.height : 100;
}
function trim(c) {
    var ctx = c.getContext('2d'), 
    // create a temporary canvas in which we will draw back the trimmed text
    copy = new canvas_1.Canvas(0, 0).getContext('2d'), 
    // Use the Canvas Image Data API, in order to get all the
    // underlying pixels data of that canvas. This will basically
    // return an array (Uint8ClampedArray) containing the data in the
    // RGBA order. Every 4 items represent one pixel.
    pixels = ctx.getImageData(0, 0, c.width, c.height), 
    // total pixels
    l = pixels.data.length, 
    // main loop counter and pixels coordinates
    i, x, y, 
    // an object that will store the area that isn't transparent
    bound = { top: null, left: null, right: null, bottom: null };
    // for every pixel in there
    for (i = 0; i < l; i += 4) {
        // if the alpha value isn't ZERO (transparent pixel)
        if (pixels.data[i + 3] !== 0) {
            // find it's coordinates
            x = (i / 4) % c.width;
            y = ~~((i / 4) / c.width);
            // store/update those coordinates
            // inside our bounding box Object
            if (bound.top === null) {
                bound.top = y;
            }
            if (bound.left === null) {
                bound.left = x;
            }
            else if (x < bound.left) {
                bound.left = x;
            }
            if (bound.right === null) {
                bound.right = x;
            }
            else if (bound.right < x) {
                bound.right = x;
            }
            if (bound.bottom === null) {
                bound.bottom = y;
            }
            else if (bound.bottom < y) {
                bound.bottom = y;
            }
        }
    }
    if (bound.top === null || bound.left === null || bound.right === null || bound.bottom === null)
        return;
    // actual height and width of the text
    // (the zone that is actually filled with pixels)
    var trimHeight = bound.bottom - bound.top, trimWidth = bound.right - bound.left, 
    // get the zone (trimWidth x trimHeight) as an ImageData
    // (Uint8ClampedArray of pixels) from our canvas
    trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);
    // Draw back the ImageData into the canvas
    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);
    // return the canvas element
    return copy.canvas;
}
class textFormatter {
    constructor(text, font) {
        this.colorMap = { "&0": [230, 230, 0], "&1": [200, 20, 175], '&2': [52, 152, 219], "&3": [230, 230, 0], "&4": [200, 20, 175], '&5': [52, 152, 219], "&6": [230, 230, 0], "&7": [200, 20, 175], '&8': [52, 152, 219] };
        this.text = text;
        this.font = font;
    }
    measureFontHeight() {
        let canvas = new canvas_1.Canvas(100, 100);
        let ctx = canvas.getContext('2d');
        ctx.font = this.font;
        ctx.textBaseline = 'top';
        ctx.fillText('Hello World', 0, 0);
        const result = trim(canvas);
        return result ? result.height : 100;
    }
    measureTextWidth(text = this.text) {
        let canvas = new canvas_1.Canvas(100, 100);
        let ctx = canvas.getContext('2d');
        ctx.font = this.font;
        return ctx.measureText(text).width;
    }
    paranthesesColor() {
        let left = [];
        let right = [];
        let pairs = [];
        for (let i = 0; i < this.text.length; i++) {
            if (this.text[i] === '(') {
                left.push(i);
            }
            else if (this.text[i] === ')') {
                right.push(i);
                let leftIndex = left.pop();
                pairs.push([typeof leftIndex == 'number' ? leftIndex : -1, i, left.length]);
            }
        }
        let modifiedStr = this.text.split('').map((char, index) => {
            if (char === '(') {
                let pair = pairs.find(pair => pair[0] === index);
                if (pair) {
                    return `\&${pair[2]}(`;
                }
            }
            else if (char === ')') {
                let pair = pairs.find(pair => pair[1] === index);
                if (pair) {
                    return `)\&${pair[2] - 1 >= 0 ? pair[2] - 1 : 0}`;
                }
            }
            return char;
        }).join('');
        this.text = modifiedStr;
        return this;
    }
    toMultiline(maxWidth = 0, wordBreak = false) {
        let colorsplit = this.text.split(/(&\d)/);
        let characters = [];
        let finalArray = [];
        colorsplit.forEach((colorText) => {
            if (wordBreak)
                characters = colorText.split(' ');
            else
                characters = colorText.split('');
            characters.forEach((char, index) => {
                if (characters[index - 1] === "&" && char.match(/\d/)) {
                    finalArray[finalArray.length - 1] += char;
                }
                else
                    finalArray.push(char);
            });
        });
        let charHeight = this.measureFontHeight();
        let str = '';
        let lines = [];
        console.log(finalArray);
        if (maxWidth > 1) {
            for (let i = 0; i < finalArray.length; i++) {
                const length = (0, utilities_1.measureText)(str.replace(/&\d/g, '').replace(/\n/g, '') + finalArray[i], this.font).width;
                if (length > maxWidth) {
                    lines.push(str);
                    str = finalArray[i];
                }
                else {
                    if (str == ' ')
                        str = '';
                    str += finalArray[i];
                }
            }
            if (str.length > 0) {
                lines.push(str);
            }
        }
        return { lineCount: lines.length, height: charHeight * lines.length, lines: lines };
    }
    parseColor(text) {
        const [textWidth, textHeight] = [this.measureTextWidth(), this.measureFontHeight()];
        let canvas = new canvas_1.Canvas(textWidth, textHeight);
        let ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = this.font;
        let textSplit = text.split(/(&\d)/g);
        console.log(textSplit);
        let color;
        let position = 0;
        for (const string in textSplit) {
            if (textSplit[string].match(/&\d/)) {
                console.log(color, textSplit[string]);
                color = this.colorMap[textSplit[string]];
                ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                continue;
            }
            ;
            ctx.fillText(textSplit[string], position, 0);
            position += ctx.measureText(textSplit[string]).width;
        }
        return canvas;
    }
    parseLines(lines) {
        let maxWidth = 0;
        lines.forEach((line, _index) => {
            let width = this.measureTextWidth(line);
            if (width > maxWidth)
                maxWidth = width;
        });
        const textHeight = this.measureFontHeight();
        console.log(maxWidth, textHeight * lines.length, lines.length, textHeight + 0.1 * textHeight);
        let canvas = new canvas_1.Canvas(maxWidth, textHeight * lines.length * 1.1);
        let ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = this.font;
        lines.forEach((line, index) => {
            let textSplit = line.split(/(&\d)/g);
            let color;
            let position = 0;
            for (const string in textSplit) {
                if (textSplit[string].match(/&\d/)) {
                    color = this.colorMap[textSplit[string]];
                    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                    continue;
                }
                ;
                ctx.fillText(textSplit[string], position, textHeight * index * 1.1);
                position += ctx.measureText(textSplit[string]).width;
            }
        });
        return canvas;
    }
}
function createGameCard(title, description, icon) {
    return __awaiter(this, void 0, void 0, function* () {
        let textFormat = new textFormatter(description, '30px Segmento');
        let descHeight = textFormat.measureFontHeight();
        let textMeasure = textFormat.paranthesesColor().toMultiline(460, true);
        let canvas = new canvas_1.Canvas(500, 120 + textMeasure.lineCount * descHeight * 1.1);
        let ctx = canvas.getContext('2d');
        let utils = new utilities_1.ContextUtilities(ctx);
        // Frame
        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#707070');
        gradient.addColorStop(1, '#404040');
        ctx.strokeStyle = gradient;
        let darkgradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        darkgradient.addColorStop(0, '#404040');
        darkgradient.addColorStop(1, '#101010');
        ctx.fillStyle = darkgradient;
        utils.roundedRect(0, 0, 500, canvas.height, 50, 10);
        ctx.stroke();
        ctx.fill();
        utils.roundedRect(0, 0, 100, 100, 50, 5);
        ctx.stroke();
        utils.roundedRect(0, 0, 500, 100, 50, 5);
        ctx.stroke();
        // Ideal Title Font
        let size = 10;
        while (ctx.measureText(title).width < 360 && size < 50) {
            size++;
            ctx.font = `${size}px Segmento`;
        }
        ctx.textBaseline = 'top';
        ctx.fillStyle = 'white';
        ctx.fillText(title, 105, (100 - textHeight(ctx.font)) / 2);
        // Description
        ctx.font = '30px Segmento';
        ctx.drawImage(textFormat.parseLines(textMeasure.lines), 20, 110);
        if (typeof icon == 'string') {
            try {
                ctx.drawImage(yield (0, canvas_1.loadImage)(icon), 5, 5, 90, 90);
            }
            catch (error) {
                console.log('error');
            }
        }
        fs.writeFileSync('./gamecard.png', canvas.toBuffer());
    });
}
<<<<<<< HEAD
function createBackgroundGradient(accentColor, accentColor2) {
    var _a;
    let canvas = new canvas_1.Canvas(1200, 300);
    let color = (_a = (0, utilities_1.hexToRgb)(accentColor)) === null || _a === void 0 ? void 0 : _a.map((v) => (0, utilities_1.intMax)(v, 125));
    console.log(color);
    let ctx = canvas.getContext('2d');
    let gradient = ctx.createLinearGradient(0, 0, 1200, 0);
    gradient.addColorStop(0, `rgb(${color === null || color === void 0 ? void 0 : color.join(',')})`);
    gradient.addColorStop(1, (0, utilities_1.defaulter)(accentColor2, '#000000'));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 1400);
    return canvas;
}
//console.log(('#ff0000'))
//colorEncoder('Test&2Test&3Test&4Test&5Test&6Test')
fs.writeFileSync(data_1.GetFile.assets + '/images/namecards/backgrounds/test.png', createBackgroundGradient('#ff0000').toBuffer());
//createNameCard(GetFile.assets + '/images/namecards/backgrounds/default.png').then((can) => {fs.writeFileSync(GetFile.assets + '/images/namecards/backgrounds/test.png', can.toBuffer());})
//createCard(GetFile.assets + '/shotgun.png', 'e', [0, (0) / 2], 1, 'h', false)
//createColorText('44+((((4 * 43) / (-25 + 27)) / (44 - (17 + 25))) + ((68 / 2) - (6 * 5))) + ((((6 / 3) * 23) / ((16 ^ 0.5) / (-18 + 20))) / (1 ^ 2))')
// (  (  8  +  5  )  -  (  5  -  6  )  )  +  (  (  5  1  +  2  0  )  -  (  2  2  -  1  0  )  )
// 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
=======
createGameCard('Solve the Problem', '((72 / (9 ^ 0.5)) - ((19 + 17) / 2)) + (12 + (36 / (-13 + 15)))', data_1.GetFile.assets + '/icons/math.png');
>>>>>>> 494c127fc07c864a2a9b4dc011809df8a43ce74b
