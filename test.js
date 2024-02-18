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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var canvas_1 = require("canvas");
var quantize = require('quantize');
var fs = require("fs");
var url = 'https://music.youtube.com/watch?v=6ywXBNpc-To&list=LM';
function createNamecard() {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, ctx, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    canvas = new canvas_1.Canvas(1200, 300);
                    ctx = canvas.getContext('2d');
                    _b = (_a = ctx).drawImage;
                    return [4 /*yield*/, (0, canvas_1.loadImage)('./Compiled/assets/images/namecards/namecard.png')];
                case 1:
                    _b.apply(_a, [_c.sent(), 0, 0, 1200, 300]);
                    //ctx.globalCompositeOperation = 'source-in';
                    ctx.globalCompositeOperation = 'difference';
                    ctx.fillStyle = 'orange';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    // ctx.drawImage(await loadImage('https://th.bing.com/th?id=OIF.uXkIoa4KAF4OGw6X%2bi3niw&rs=1&pid=ImgDetMain'), 0, 0, 1200, 400)
                    // ctx.globalAlpha = 0;
                    // ctx.globalCompositeOperation = 'source-over';
                    // ctx.drawImage(await loadImage('./Compiled/assets/images/namecards/namecard.png'), 0, 0, 1200, 300)
                    fs.writeFileSync('./newcard.png', canvas.toBuffer());
                    return [2 /*return*/];
            }
        });
    });
}
function createBackgroundImage(url) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, ctx, image, height, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    canvas = new canvas_1.Canvas(1200, 300);
                    ctx = canvas.getContext('2d');
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
                    return [4 /*yield*/, (0, canvas_1.loadImage)(url)];
                case 1:
                    image = _c.sent();
                    height = Math.round((image.height / image.width) * 1200);
                    console.log(height);
                    _b = (_a = ctx).drawImage;
                    return [4 /*yield*/, (0, canvas_1.loadImage)(url)];
                case 2:
                    _b.apply(_a, [_c.sent(), 0, -(height - 300) / 2, 1200, height]);
                    return [2 /*return*/, canvas];
            }
        });
    });
}
function createTemplate(url) {
    return __awaiter(this, void 0, void 0, function () {
        var canvas, ctx, palette, gradient, offset;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    canvas = new canvas_1.Canvas(1200, 300);
                    ctx = canvas.getContext('2d');
                    return [4 /*yield*/, getPalette(url)];
                case 1:
                    palette = _a.sent();
                    gradient = ctx.createLinearGradient(0, 0, 1200, 0);
                    gradient.addColorStop(0, palette[0]);
                    gradient.addColorStop(1, palette[1]);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 20;
                    offset = ctx.lineWidth / 2;
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
                    return [2 /*return*/, canvas];
            }
        });
    });
}
function createNameCard(url) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, canvas, ctx, _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, canvas_1.loadImage)(url)];
                case 1:
                    _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _e.sent();
                    url = "./Compiled/assets/images/namecards/namecard.png";
                    return [3 /*break*/, 3];
                case 3:
                    canvas = new canvas_1.Canvas(1200, 300);
                    ctx = canvas.getContext('2d');
                    _b = (_a = ctx).drawImage;
                    return [4 /*yield*/, createBackgroundImage(url)];
                case 4:
                    _b.apply(_a, [_e.sent(), 0, 0, 1200, 300]);
                    _d = (_c = ctx).drawImage;
                    return [4 /*yield*/, createTemplate(url)];
                case 5:
                    _d.apply(_c, [_e.sent(), 0, 0, 1200, 300]);
                    fs.writeFileSync('./newcard.png', canvas.toBuffer());
                    return [2 /*return*/];
            }
        });
    });
}
function getPalette(url) {
    return __awaiter(this, void 0, void 0, function () {
        var quality, image, canvas, ctx, pixelCount, imageData, pixels, i, offset, r, g, b, a, cmap, palette, colors, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    quality = 10;
                    return [4 /*yield*/, (0, canvas_1.loadImage)(url)];
                case 1:
                    image = (_a.sent());
                    canvas = new canvas_1.Canvas(image.width, image.height);
                    ctx = canvas.getContext('2d');
                    pixelCount = image.width * image.height;
                    ctx.drawImage(image, 0, 0, image.width, image.height);
                    imageData = ctx.getImageData(0, 0, image.width, image.height).data;
                    pixels = [];
                    for (i = 0, offset = void 0, r = void 0, g = void 0, b = void 0, a = void 0; i < pixelCount; i = i + quality) {
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
                    cmap = quantize(pixels, 2);
                    palette = cmap ? cmap.palette() : null;
                    console.log(palette);
                    colors = [];
                    for (i = 0; i < palette.length; i++) {
                        colors.push("rgb( ".concat(palette[i][0], " ").concat(palette[i][1], " ").concat(palette[i][2], " )"));
                    }
                    return [2 /*return*/, colors];
            }
        });
    });
}
createNameCard(url);
