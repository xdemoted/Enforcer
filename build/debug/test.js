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
function autoScaleCardBackground(url = data_1.GetFile.assets + '/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = 1, mode = 'h', mark) {
    return __awaiter(this, void 0, void 0, function* () {
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
function cardBackground(url = data_1.GetFile.assets + '/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = [1, 1], mark) {
    return __awaiter(this, void 0, void 0, function* () {
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
function addFrame(source, rank, scale = 1) {
    return __awaiter(this, void 0, void 0, function* () {
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
function multiDraw(amount, guarantee = false, pity = 0) {
    let results = [];
    for (let i = 0; i < amount; i++) {
        results.push((0, utilities_1.cardDraw)(guarantee, pity));
    }
    return results;
}
function rollTest(pity = 0) {
    let rolls = multiDraw(1000000, false, pity);
    let fails = 0;
    let ones = 0;
    let twos = 0;
    let threes = 0;
    for (let i = 0; i < rolls.length; i++) {
        const roll = rolls[i];
        if (!roll)
            fails++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 1)
            ones++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 2)
            twos++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 3)
            threes++;
    }
    const total = ones + twos + threes;
    console.log(pity);
    console.log('Failed Rolls:', fails / rolls.length * 100 + '%', `(${fails})`);
    console.log('Successful Rolls:', total / rolls.length * 100 + '%', `(${total})`);
    console.log('One Star Rolls:', ones / rolls.length * 100 + '%', `(${ones})`);
    console.log('Two Star Rolls:', twos / rolls.length * 100 + '%', `(${twos})`);
    console.log('Three Star Rolls:', threes / rolls.length * 100 + '%', `(${threes})`);
    console.log('Three Star (Isolated):', Math.round((threes / total) * 10000) / 100, '%');
    console.log('Two Star (Isolated):', Math.round((twos / total) * 10000) / 100, '%');
    console.log('One Star (Isolated):', Math.round((ones / total) * 10000) / 100, '%');
}
function generateCalculator(color, strokeColor) {
    let canvas = new canvas_1.Canvas(250, 250);
    let ctx = canvas.getContext('2d');
    let ctxUtils = new utilities_1.ContextUtilities(ctx);
    ctxUtils.roundedRect(0, 0, 250, 250, 125, 0);
    let gradient = ctx.createRadialGradient(125, 125, 0, 125, 125, 125);
    gradient.addColorStop(0, `rgb(${color[0]},${color[1]},${color[2]})`);
    gradient.addColorStop(1, `rgb(${color.map((c) => { return Math.round(c * 0.5); }).join(',')})`);
    ctx.strokeStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`;
    ctxUtils.roundedRect(75, 50, 100, 135, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 60, 80, 30, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 95, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(113, 95, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(141, 95, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 123, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(113, 123, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(141, 123, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(85, 151, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(113, 151, 24, 24, 5, 5);
    ctx.stroke();
    ctxUtils.roundedRect(141, 151, 24, 24, 5, 5);
    ctx.stroke();
    fs.writeFileSync('./calculator.png', canvas.toBuffer());
    return canvas;
}
function getBackground(h, color) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1000, h);
        let ctx = canvas.getContext('2d');
        let utils = new utilities_1.ContextUtilities(ctx);
        let radial = ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
        radial.addColorStop(0, `rgb(${color.map((c) => Math.round(c * 0.75)).join(',')})`);
        radial.addColorStop(1, `rgb(${color.map((c) => Math.round(c * 0.5)).join(',')})`);
        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, `rgb(${color.join(',')})`);
        gradient.addColorStop(1, `rgb(${color.map((c) => Math.round(c * 0.75)).join(',')})`);
        ctx.strokeStyle = gradient;
        let darkgradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        darkgradient.addColorStop(0, `rgb(${color.map((c) => Math.round(c * 0.75)).join(',')})`);
        darkgradient.addColorStop(1, `rgb(${color.map((c) => Math.round(c * 0.5)).join(',')})`);
        ctx.fillStyle = darkgradient;
        utils.roundedRect(0, 0, 1000, canvas.height, 50, 0);
        ctx.fill();
        ctx.fillStyle = gradient;
        utils.roundedRect(5, 5, 990, 90, 45, 0);
        ctx.fill();
        ctx.fillStyle = darkgradient;
        utils.roundedRect(0, 0, 100, 100, 50, 0);
        ctx.fill();
        ctx.fillStyle = radial;
        utils.roundedRect(5, 5, 90, 90, 45, 0);
        ctx.fill();
        ctx.fillStyle = gradient;
        utils.roundedRect(5, 100, 990, canvas.height - 105, 50, 0);
        ctx.fill();
        return canvas;
    });
}
function createGameCard(title, description, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.color)
            options.color = [180, 180, 180];
        let descFormat = new utilities_1.markdownText(description, '20px Segmento');
        let titleFormat = new utilities_1.markdownText('&f' + title, '40px Segmento');
        // Formatting
        descFormat.splitLines(960);
        if (options.paranthesesColor)
            descFormat.paranthesesColor();
        titleFormat.autoScale(0, 885, 80);
        // Canvases
        let descCanvas = descFormat.parseLines(10, 960);
        let titleCanvas = titleFormat.parseLines(10, 960);
        let canvas = new canvas_1.Canvas(1000, 130 + descCanvas.height);
        let ctx = canvas.getContext('2d');
        const utils = new utilities_1.ContextUtilities(ctx);
        // Frame
        utils.roundedRect(0, 0, 1000, canvas.height, 50, 0);
        ctx.clip();
        let h = 0;
        while (h < canvas.height) {
            ctx.drawImage(yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/metalBack.png'), 0, h, 1000, 500);
            h += 500;
        }
        ctx.restore();
        ctx.drawImage(yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/metalIcon.png'), 5, 5, 90, 90);
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(yield getBackground(canvas.height, options.color), 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        if (options.icon)
            ctx.drawImage(options.icon, 5, 5, 90, 90);
        ctx.drawImage(titleCanvas, 110, 10);
        ctx.drawImage(descCanvas, 20, 110);
        return canvas;
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        let flag = yield (0, utilities_1.createImageCanvas)('https://flagcdn.com/w2560/us.png', [460, 0], 10);
        let canvas = yield createGameCard('Math the solve', [
            `## (((6 / 2) * (8 / (6 / 3))) / (((2 ^ 2) ^ 0.5) / 2)) + (((2 / (1 ^ 0.5)) * 17) / (((64 ^ 0.5) / (4 ^ 0.5)) ^ 0.5)) = &b100&f`,
            flag,
            'Answered correctly by:',
            '# Answered correctly by:',
            `abcdefghijklmnopqrstuvwxyz0123456789!"#$'()*+,-./:;<=>?[\]^_|%&\`{}`
        ], { color: [0, 180, 180], icon: generateCalculator([0, 180, 180], [255, 255, 255]), paranthesesColor: true });
        fs.writeFileSync('./gamecard.png', canvas.toBuffer());
        canvas = new canvas_1.Canvas(100, 100);
        let ctx = canvas.getContext('2d');
        ctx.font = '20px Segmento';
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        ctx.fillText('H el l o', 0, 20);
        fs.writeFileSync('./text.png', canvas.toBuffer());
    });
}
test();
//test()
//rollTest()
