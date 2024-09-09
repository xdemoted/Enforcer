import { AttachmentBuilder, Client, EmbedBuilder, TextChannel } from "discord.js";
import { baseGame } from "../../gamemanager";
import { random, MathGenerator, createColorText, maps, markdownText, createGameCard, ContextUtilities } from "../../utilities";
import { Canvas } from "canvas";
function generateCalculator(strokeColor: [number, number, number]) {
    let canvas = new Canvas(250, 250)
    let ctx = canvas.getContext('2d');
    let ctxUtils = new ContextUtilities(ctx as unknown as CanvasRenderingContext2D);
    ctx.strokeStyle = `rgb(${strokeColor[0]},${strokeColor[1]},${strokeColor[2]})`
    ctxUtils.roundedRect(75, 50, 100, 135, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(85, 60, 80, 30, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(85, 95, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(113, 95, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(141, 95, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(85, 123, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(113, 123, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(141, 123, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(85, 151, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(113, 151, 24, 24, 5, 5)
    ctx.stroke()
    ctxUtils.roundedRect(141, 151, 24, 24, 5, 5)
    ctx.stroke()
    return canvas;
}
export default class math extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        let difficulty = random(1, 3)
        const equation = MathGenerator.generateEquation((difficulty == 1) ? maps.easy : (difficulty == 2) ? maps.medium : maps.hard)
        const color: [number, number, number] = (difficulty == 1) ? [40, 180, 40] : (difficulty == 2) ? [180, 180, 40] : [180, 40, 40]
        const reward = difficulty * 100
        let text = [
            `## &f${equation[0]}`,
            '&f',
            '{c}## &fUnanswered'
        ]
        const canvas = await createGameCard('&fSolve The Equation', text, { color: color, icon: generateCalculator([255, 255, 255]), paranthesesColor: true })
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' })
        this.message = await this.channel.send({ files: [attachment] })
        this.collector = this.channel.createMessageCollector({ time: 3600000 })
        this.collector.on('collect', async msg => {
            if (msg.content == equation[1].toString() && this.message) {
                this.emit('correctanswer', msg, reward)
                text.splice(2, 1, `{c}# &b${msg.author.displayName} solved the equation`)
                const canvas = await createGameCard('&fSolve The Equation', text, { color: [180, 180, 180], icon: generateCalculator([255, 255, 255]), paranthesesColor: true })
                const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' })
                this.message.edit({ files: [attachment] })
                if (this.collector) this.collector.stop();
            }
        })
    }
    end() {
        if (this.message && this.message.deletable) {
            this.message.delete()
        }
        if (this.collector) this.collector.stop();
    }
}
exports.default = math;
