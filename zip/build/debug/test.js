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
const canvas_1 = require("canvas");
var quantize = require('quantize');
const fs = __importStar(require("fs"));
const utilities_1 = require("../modules/utilities");
const url = 'https://music.youtube.com/watch?v=6ywXBNpc-To&list=LM';
function createNamecard() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield (0, canvas_1.loadImage)('./Compiled/assets/images/namecards/namecard.png'), 0, 0, 1200, 300);
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
function createNameCard(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, canvas_1.loadImage)(url);
        }
        catch (error) {
            url = "./Compiled/assets/images/namecards/namecard.png";
        }
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield createBackgroundImage(url), 0, 0, 1200, 300);
        ctx.drawImage(yield createTemplate(url), 0, 0, 1200, 300);
        fs.writeFileSync('./newcard.png', canvas.toBuffer());
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
        let star = yield (0, canvas_1.loadImage)('./assets/images/star.png');
        let baseCard = yield (0, canvas_1.loadImage)('./assets/images/tradecards/threestar.png');
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
function autoScaleCardBackground(url = './assets/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = 1, mode = 'h', mark) {
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
function cardBackground(url = './assets/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = [1, 1], mark) {
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
                sourceImage = yield (0, canvas_1.loadImage)('./assets/images/tradecards/backgrounds/default.png');
            }
        }
        let frame;
        if (rank == 1 || rank == 2 || rank == 3)
            frame = yield (0, canvas_1.loadImage)(`./assets/images/tradecards/frames/${rank}star.png`);
        else
            frame = yield (0, canvas_1.loadImage)('./assets/images/tradecards/frames/default.png');
        ctx.drawImage(sourceImage, 0, 0, 1000 * scale, 1400 * scale);
        ctx.drawImage(frame, 0, 0, 1000 * scale, 1400 * scale);
        return canvas;
    });
}
function createCard(source, rank, translation = [0, 0], scale = 1, mode = 'h', mark) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = yield autoScaleCardBackground(source, translation, scale, mode, mark);
        fs.writeFileSync('../newCards/noframe.png', canvas.toBuffer());
        let frame = yield addFrame(canvas, rank, scale);
        fs.writeFileSync('../newCards/withframe.png', frame.toBuffer());
        return frame;
    });
}
function listCards() {
    return __awaiter(this, void 0, void 0, function* () {
        let manifest = require('./assets/images/tradecards/manifest.json');
        console.log(manifest.cards);
        let resolution = 0.25;
        let canvas = new canvas_1.Canvas(Math.floor((manifest.cards.length - 1) / 6) * 1000 * resolution + 1000 * resolution, 8400 * resolution);
        let context = canvas.getContext('2d');
        for (let i = 0; i < manifest.cards.length; i++) {
            context.drawImage(yield (0, canvas_1.loadImage)((yield addFrame('./assets/images/tradecards/backgrounds/' + manifest.cards[i].background, manifest.cards[i].rank)).toBuffer()), Math.floor(i / 6) * 1000 * resolution, (i % 6) * 1400 * resolution, 1000 * resolution, 1400 * resolution);
            console.log(i, "/", manifest.cards.length - 1, "done");
        }
        fs.writeFileSync('../cards.png', canvas.toBuffer());
        return canvas;
    });
}
let scale = 1;
//fs.readdir('./assets/images/tradecards/backgrounds', (err, files) => {console.log(files)})
//listCards()
createCard('https://moparblog.com/wp-content/uploads/2013/07/George-Washington-Dodge-Challenger.jpg', 3, [150, (1400 * scale - 1400) / 2], scale, 'h', true);
//createCard('../redacted.png', 3, [0, (1400 * scale - 1400) / 2], scale, 'h', false)
// DOVER https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7a4d4f7e-ea30-4b24-a0ba-485be1c26475/d4jvv00-7dbcd70b-140f-4aad-a4d1-8fe381f0b012.jpg/v1/fill/w_900,h_1135,q_75,strp/dover_demon_by_chr_ali3_d4jvv00-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTEzNSIsInBhdGgiOiJcL2ZcLzdhNGQ0ZjdlLWVhMzAtNGIyNC1hMGJhLTQ4NWJlMWMyNjQ3NVwvZDRqdnYwMC03ZGJjZDcwYi0xNDBmLTRhYWQtYTRkMS04ZmUzODFmMGIwMTIuanBnIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.pjzpBDKbg_6pchvx6axCPlS3Z8N8z3ifpwKYU6W0DPA
