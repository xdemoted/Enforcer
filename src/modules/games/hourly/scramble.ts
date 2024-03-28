import { Client, EmbedBuilder, TextChannel } from "discord.js"
import { baseGame } from "../../gamemanager"
import { random } from "../../utilities"
import axios from "axios"
export default class scramble extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        let word: string = ''
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
        try {
            word = (await axios.get('https://random-word-api.herokuapp.com/word?length=' + length)).data[0]
        } catch (error) {
            return
        }
        let scrambledWord = word
        while (word == scrambledWord) {
            scrambledWord = scramble.wordScramble(word)
        }
        let embed = new EmbedBuilder().setTitle("Unscramble The Word").setDescription(scrambledWord).setTimestamp().setColor(difficulty == 1 ? "Green" : difficulty == 2 ? "Yellow" : "Red")
        const reward = Math.round(100 * ((length - 3) ** 0.75))
        embed.setFooter({ text: "Unscramble for " + reward + "xp" })
        let message = await this.channel.send({ embeds: [embed] })
        let solved = false
        this.collector = this.channel.createMessageCollector({ time: 3600000 })
        this.collector.on('collect', async msg => {
            if (msg.content.toLowerCase() == word.toLowerCase()) {
                this.emit('correctanswer', msg, reward)
                solved = true
                embed.setFields([{ name: "Answer", value: word, inline: true }])
                    .setTitle(`${msg.member?.displayName} unscrambled the word.`)
                    .setFooter({ text: "Unscrambled for " + reward + "xp" })
                    .setColor("NotQuiteBlack")
                message.edit({ embeds: [embed] })
                if (this.collector) this.collector.stop();
            }
        })
        this.collector.on('end', () => {
            if (!solved) {
                embed.setFooter({ text: "Unscramble for " + reward + "xp" })
                    .setFields([{ name: "Answer", value: word, inline: true }])
                    .setColor("NotQuiteBlack")
                message.edit({ embeds: [embed] })
            }
        });
    }
    end() {
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