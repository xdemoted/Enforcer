import { EmbedBuilder, TextChannel, ThreadChannel } from 'discord.js';
import axios from 'axios';
let defaultEmbeds = { math: new EmbedBuilder().setTitle("Math").setColor("Green").setFooter({ text: "Math Game" }).setTimestamp().setDescription("Solve the math problem below!"), trivia: new EmbedBuilder().setTitle("Trivia").setColor("LuminousVividPink") }
class mathGame {
    channel: TextChannel;
    cyclic: boolean | undefined;
    constructor(channel: TextChannel, cyclic?: boolean) {
        this.channel = channel;
        this.cyclic = cyclic;
    }
    init() {
    }
}
class gameManager {
    channel: string;
    cyclic: boolean | undefined;
    constructor(channel: string, cyclic?: boolean) {
        this.channel = channel;
        this.cyclic = cyclic;
    }
    init() {

    }
}
class blackjackThread {
    channel: ThreadChannel
    player: GuildMember
    constructor(channel: ThreadChannel, player: GuildMember) {
        this.channel = channel
        this.player = player
    }
    createThread () {
        
    }
}
class dailyQB {
    channel: string;
    prompt: string[];
    answer: string;
    constructor (channel: string) {
        this.channel = channel;
        this.prompt = [];
        this.answer = "";
        this.getPrompt()
    }
    async getPrompt() {
        try {
            const response = await axios.get('https://qbreader.org/api/random-tossup/');
            let data = response.data;
            this.prompt = response.data.question.split(".")
            this.answer = data.formatted_answer
            
        } catch (error) {
            console.error(error);
        }
    }
}
let qb = new dailyQB("fakeChannel")
console.log(qb.prompt)
console.log(qb.answer)