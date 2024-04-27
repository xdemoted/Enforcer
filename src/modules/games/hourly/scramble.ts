import { AttachmentBuilder, Client, EmbedBuilder, TextChannel } from "discord.js"
import { baseGame } from "../../gamemanager"
import { createGameCard, getWord, random } from "../../utilities"
import axios from "axios"
export default class scramble extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        let difficulty = random(1, 3)
        let length = 5
        switch (difficulty) {
            case 1: {
                length = random(4, 5)
            } break;
            case 2: {
                length = random(6, 7)
            } break;
            case 3: {
                length = random(8, 9)
            } break;
        }
        let word = getWord(length)
        let scrambledWord = word
        while (word == scrambledWord) {
            scrambledWord = scramble.wordScramble(word)
        }
        let text = [
            `{c}## &f${scrambledWord}`,
            '&f',
            '{c}## &fUnanswered'
        ]
        console.log(word, scrambledWord, difficulty)
        const color: [number, number, number] = (difficulty == 1) ? [40, 180, 40] : (difficulty == 2) ? [180, 180, 40] : [180, 40, 40]
        const canvas = await createGameCard('&fUnscramble The Word', text, { color: color, paranthesesColor: true })
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' })
        const reward = 100 * difficulty
        this.message = await this.channel.send({ files: [attachment] })
        let solved = false
        this.collector = this.channel.createMessageCollector({ time: 3600000 })
        this.collector.on('collect', async msg => {
            if (msg.content.toLowerCase() == word.toLowerCase() && this.message) {
                this.emit('correctanswer', msg, reward)
                solved = true
                let text = [
                    `{c}## &f${scrambledWord} = ${word}`,
                    '&f',
                    `{c}## &b${msg.author.displayName} Unscrambled the word`
                ]
                const canvas = await createGameCard('&fUnscramble The Word', text, { color: [180, 180, 180], paranthesesColor: true })
                this.message.edit({ files: [new AttachmentBuilder(canvas.toBuffer(), { name: 'calculator.png' })] })
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
    static wordScramble(word: string) {
        let scrambledWord = "";
        const wordArray = word.split("");
        while (wordArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * wordArray.length);
            scrambledWord += wordArray.splice(randomIndex, 1)[0];
        }
        return scrambledWord;
    }
}