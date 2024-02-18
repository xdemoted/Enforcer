import { Canvas, CanvasGradient, loadImage } from "canvas";
var quantize = require('quantize');
import * as fs from "fs";
import { RgbPixel } from "quantize";
const url = 'https://music.youtube.com/watch?v=6ywXBNpc-To&list=LM';
async function createNamecard() {
    let canvas = new Canvas(1200, 300);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(await loadImage('./Compiled/assets/images/namecards/namecard.png'), 0, 0, 1200, 300)
    //ctx.globalCompositeOperation = 'source-in';
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(await loadImage('https://th.bing.com/th?id=OIF.uXkIoa4KAF4OGw6X%2bi3niw&rs=1&pid=ImgDetMain'), 0, 0, 1200, 400)
    // ctx.globalAlpha = 0;
    // ctx.globalCompositeOperation = 'source-over';
    // ctx.drawImage(await loadImage('./Compiled/assets/images/namecards/namecard.png'), 0, 0, 1200, 300)
    fs.writeFileSync('./newcard.png', canvas.toBuffer());
}
async function createBackgroundImage(url:string) {
    let canvas = new Canvas(1200, 300);
    let ctx = canvas.getContext('2d');
    ctx.fillRect(325, 200, 700, 50)
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.fill()
    ctx.globalCompositeOperation = 'source-out'
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(1050, 0);
    ctx.arc(1050, 150, 150, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(150, 300);
    ctx.fill()
    ctx.globalCompositeOperation = 'source-in'
    let image = await loadImage(url);
    let height = Math.round((image.height/image.width)*1200)
    console.log(height)
    ctx.drawImage(await loadImage(url), 0, -(height-300)/2, 1200, height)
    return canvas;
}
async function createTemplate(url:string) {
    let canvas = new Canvas(1200, 300);
    let ctx = canvas.getContext('2d');
    let palette = await getPalette(url);
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
}
async function createNameCard(url:string) {
    try {
        await loadImage(url)
    } catch (error) {
        url = "./Compiled/assets/images/namecards/namecard.png"
    }
    let canvas = new Canvas(1200, 300);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(await createBackgroundImage(url), 0, 0, 1200, 300)
    ctx.drawImage(await createTemplate(url), 0, 0, 1200, 300)
    fs.writeFileSync('./newcard.png', canvas.toBuffer());
}
async function getPalette(url: string) {
    const quality = 10;
    let image = (await loadImage(url))
    let canvas = new Canvas(image.width, image.height);
    let ctx = canvas.getContext('2d');
    let pixelCount = image.width * image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height)
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
    const cmap = quantize(pixels as RgbPixel[], 2);
    const palette = cmap? cmap.palette() : null;
    console.log(palette)
    let colors = []
    for (let i = 0; i < palette.length; i++) {
        colors.push(`rgb( ${palette[i][0]} ${palette[i][1]} ${palette[i][2]} )`);
    }
    return colors;
}
createNameCard(url);