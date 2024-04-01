import { Client, ColorResolvable, EmbedBuilder, TextChannel } from 'discord.js';
import { generateEquation, maps, random } from '../../utilities';
import { baseGame } from '../../gamemanager';
export default class math extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        let difficulty = random(1, 3)
        let equation: [string, number] = ['error: type 0 to answer correctly', 0]
        let color: ColorResolvable = "Green"
        switch (difficulty) {
            case 1: {
                equation = generateEquation(maps.easy)
            } break;
            case 2: {
                equation = generateEquation(maps.medium)
                color = "Yellow"
            } break;
            case 3: {
                equation = generateEquation(maps.hard)
                color = "Red"
            } break;
        }
        let embed = new EmbedBuilder().setTitle("Solve the math problem.").setDescription(equation[0]).setTimestamp().setFooter({ text: "Solve for " + difficulty * 100 + "xp" }).setColor(color)
        let answer = equation[1]
        if (this.channel instanceof TextChannel) {
            this.message = await this.channel.send({ embeds: [embed] })
            this.collector = this.channel.createMessageCollector({ time: 3600000 })
            this.collector.on('collect', async msg => {
                if (msg.content.replace(/[^-0-9]/g, "") == answer.toString()) {
                    this.emit('correctanswer', msg, difficulty * 100)
                    embed.setFields([{ name: "Answer", value: answer.toString(), inline: true }])
                        .setTitle(`${msg.member?.displayName} solved the problem.`)
                        .setFooter({ text: "Solved for " + difficulty * 100 + " xp" })
                    if (this.message)
                    this.message.edit({ embeds: [embed] })
                    if (this.collector) this.collector.stop();
                    setTimeout(() => {
                        if (msg.deletable) msg.delete();
                    }, 5000);
                }
            })

        }
    }
    end() {
        if (this.message && this.message.deletable) this.message.delete();
        if (this.collector) this.collector.stop();
    }
}