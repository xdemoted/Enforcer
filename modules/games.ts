import { EmbedBuilder, TextChannel, ThreadChannel } from 'discord.js';
import axios from 'axios';
import { GuildMember } from './data';
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
class games {
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
    createThread() {

    }
}
export class dailyQB {
    message: string = ''
    channel: string = ''
    prompt: string[] = [];
    answer: string = '';
    open: boolean = true;
    startTime: number = Date.now();
    static async init(channel: string) {
        try {
            let qb = new dailyQB()
            const response = await axios.get('https://qbreader.org/api/random-tossup/');
            let data = response.data;
            let prompt: Array<string> = response.data.tossups[0].question.split(".")
            if (prompt[prompt.length - 1] == "") {
                prompt.splice(prompt.length - 1, 1)
            }
            qb.channel = channel
            qb.prompt = prompt
            qb.answer = data.tossups[0].formatted_answer
            return qb
        } catch (error) {
            return new dailyQB()
        }
    }
    async checkanswer(answer: string) {
        try {
            const response = await axios.get('https://qbreader.org/api/check-answer/', { params: { answerline: this.answer, givenAnswer: answer } });
            return response.data.directive
        } catch (error) {
            return 'error';
        }
    }

}