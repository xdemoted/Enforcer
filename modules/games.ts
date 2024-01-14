import { ActionRowBuilder, Client, ColorResolvable, EmbedBuilder, MessageCollector, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel, ThreadChannel, GuildMember as DiscordGuildMember, InteractionCollector, ComponentType } from 'discord.js';
import axios from 'axios';
import data, { GuildMember, GuildMemberManager } from './data';
import { RunTimeEvents } from './RunTimeEvents';
import { isSqrt, multiples, random, stringMax, triviaData } from './utilities';
const easyVM = { "*": .05, "-": .475, "+": 0.475 }
const medVM = { "*": .3, "-": .3, "+": 0.3 }
const hardVM = { "*": .3, "-": .3, "+": 0.3 }
const impossibleVM = { "*": .1, "-": .5, "+": 0.4 }
let valueMap = { "+": 10, "-": 20, "*": 30, "/": 40 }
const chanceMap = { "*": .2, "-": .3, "+": 0.3 }
export type GameValues = { guildId: string, currentValue: string, reward: number, type: number }
function generateEquation(vm: any) {
    let termCount = random(3, 6)
    if (vm == impossibleVM) {
        termCount = random(100, 200)
    } else if (vm == hardVM) {
        termCount = random(6, 9)
    }
    let terms: any[] = []
    let tAvg = 0
    let signValue = 0
    for (let i = 0; i < termCount; i++) {
        let term = random(3, 50)
        terms.push(term)
        tAvg = tAvg + term
    }
    tAvg = Math.round(tAvg / termCount)
    if (random(0, 1) == 1) {
        let tindex = random(0, terms.length - 1)
        let term: any = terms[tindex]
        let multipleArray = multiples(term)
        if (multipleArray.length > 1) {
            let multiple = 0
            while (multiple == term || multiple == 0) {
                multiple = multipleArray[random(0, multipleArray.length - 1)]
            }
            term = `(${term} / ${multiple})`
            terms[tindex] = term
        }
        signValue = 40
    }
    for (let i = 0; i < 3; i++) {
        let randTerm = random(0, terms.length - 1)
        if (typeof terms[randTerm] == 'number' || (typeof terms[randTerm] == 'string' && !(terms[randTerm] as string).includes('^'))) {
            let term: number = typeof terms[randTerm] == 'string' ? eval(terms[randTerm]) : terms[randTerm]
            if (isSqrt(term)) {
                terms[randTerm] = `${terms[randTerm]}^0.5`
                signValue = signValue + 30
            } else if (term <= 10) {
                terms[randTerm] = `${terms[randTerm]}^2`
                signValue = signValue + 30
            }
        } else {
            i--
        }
    }
    let equation: string = ''
    for (let i = 0; i < terms.length - 1; i++) {
        const term = terms[i]
        let values = getSign(vm)
        signValue = signValue + (values[1] as number)
        equation = equation + `${term} ${values[0]} `
    }
    equation = equation + terms[terms.length - 1]
    let value = signValue + tAvg + Math.abs(eval(equation.replace(/\^/g, '**')) * (random(1, 4) / 10))
    return [equation, Math.round((value > 300) ? 300 : value)] as [string, number]
}
function getSign(vm: any) {
    let value: undefined | any[] = undefined
    while (value == undefined) {
        if (Math.random() < vm["+"]) {
            value = ['+', valueMap["+"]]
        } else if (Math.random() < vm["-"]) {
            value = ['-', valueMap["-"]]
        } else if (Math.random() < vm["*"]) {
            value = ['*', valueMap["*"]]
        }
    }
    return value
}
class mathGame {
    client: Client;
    channel: TextChannel;
    collector: (MessageCollector | undefined);
    constructor(client: Client, channel: TextChannel) {
        this.channel = channel;
        this.client = client;
    }
    async init() {
        let difficulty = random(1, 3)
        let equation: [string, number] = ['error: type 0 to answer correctly', 0]
        let color: ColorResolvable = "Green"
        switch (difficulty) {
            case 1: {
                equation = generateEquation(easyVM)
            } break;
            case 2: {
                equation = generateEquation(medVM)
                color = "Yellow"
            } break;
            case 3: {
                if (random(3, 6) == 5) {
                    equation = generateEquation(impossibleVM)
                    equation[1] = 1500
                    color = "DarkRed"
                } else {
                    equation = generateEquation(hardVM)
                    color = "Red"
                }
            } break;
            default:
                break;
        }
        let embed = new EmbedBuilder().setTitle("Solve the math problem.").setDescription(equation[0]).setTimestamp().setFooter({ text: "Solve for " + equation[1] + "xp" }).setColor(color)
        let reward = equation[1]
        let answer = eval(equation[0].replace(/\^/g, '**'))
        if (this.channel instanceof TextChannel) {
            let message = await this.channel.send({ embeds: [embed] })
            this.collector = this.channel.createMessageCollector({ time: 3600000 })
            this.collector.on('collect', async msg => {
                console.log()
                if (msg.content.replace(/\D/g, "") == answer) {
                    let user = new GuildMemberManager(data.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id))
                    user.addXP(reward)
                    user.addWallet(10)
                    embed.setFields([{ name: "Answer", value: answer.toString(), inline: true }])
                        .setTitle(`${msg.author.displayName} solved the problem.`)
                        .setFooter({ text: "Solved for " + equation[1] + "xp" })
                    message.edit({ embeds: [embed] })
                    let rewardMsg = await msg.channel.send(`<@${msg.author.id}> solved the problem.`)
                    setTimeout(() => {
                        if (msg.deletable) msg.delete()
                        rewardMsg.delete()
                    }, 20000)
                    if (this.collector) this.collector.stop();
                }
            })

        }
    }
    end() {
        if (this.collector) this.collector.stop();
    }
}
class triviaGame {
    client: Client;
    channel: TextChannel;
    collector: (InteractionCollector<StringSelectMenuInteraction> | undefined);
    constructor(client: Client, channel: TextChannel) {
        this.client = client;
        this.channel = channel;
    }
    async init() {
        let embed = new EmbedBuilder().setTitle("Trivia").setTimestamp().setColor("Green")
        if (this.channel instanceof TextChannel) {
            let difficulty = "easy"
            switch (random(1, 3)) {
                case 2:
                    difficulty = "medium"
                    embed.setColor("Yellow")
                    break;
                case 3:
                    difficulty = "hard"
                    embed.setColor("Red")
                    break;
                default:
                    break;
            }
            let trivia: triviaData["data"][0]
            try {
                trivia = (await axios.get(`https://the-trivia-api.com/api/questions?limit=1&difficulty=${difficulty}`)).data[0]
            } catch (error) {
                return console.log(error)
            }
            let answers = trivia.incorrectAnswers.concat(trivia.correctAnswer)
            let answerIndex = answers.indexOf(trivia.correctAnswer)
            let selectmenu = new StringSelectMenuBuilder().setCustomId("trivia").setPlaceholder("Select an answer").addOptions(answers.map((answer, index) => {
                return { label: answer, value: index.toString() }
            }))
            let row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectmenu)
            embed.setDescription(stringMax(trivia.question, 4096))
            let triviaMessage = await this.channel.send({ embeds: [embed], components: [row] })
            let answerers: String[] = []
            let CorrectAnswerers: String[] = []
            let strings = ["1st. ", "2nd. ", "3rd. "];
            this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: triviaMessage }).on('collect', async interaction => {
                let member = interaction.member
                if (interaction.customId == "trivia" && interaction instanceof StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof DiscordGuildMember) {
                    answerers.push(interaction.user.id)
                    CorrectAnswerers.push(interaction.user.id)
                    let user = new GuildMemberManager(data.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id))
                    if (interaction.values[0] == answerIndex.toString()) {
                        user.addXP((trivia.difficulty == "easy" ? 100 : trivia.difficulty == "medium" ? 200 : 300) / CorrectAnswerers.length)
                        user.addWallet(10)
                        embed.addFields([{ name: strings[answerers.length - 1] ? strings[answerers.length - 1] : `${CorrectAnswerers.length}th. `, value: member.displayName, inline: true }])
                        triviaMessage.edit({ embeds: [embed], components: [row] })
                        let message = await interaction.reply(`<@${interaction.user.id}> answered correctly.`)
                        setTimeout(() => {
                            message?.delete()
                        }, 20000);
                    } else {
                        let message = await interaction.reply(`<@${interaction.user.id}> answered incorrectly.`)
                        setTimeout(() => {
                            message?.delete()
                        }, 20000);
                    }
                }
            }).on('end', () => {
                embed.setFooter({ text: "Correct answer: " + trivia.correctAnswer })
                embed.setColor("NotQuiteBlack")
                selectmenu.setDisabled(true)
                triviaMessage.edit({ embeds: [embed], components: [row] })
            }) as InteractionCollector<StringSelectMenuInteraction>;
        }
    }
    end() {

    }
}
class scrambleGame {
    client: Client;
    channel: TextChannel;
    collector: MessageCollector | undefined;
    constructor(client: Client, channel: TextChannel) {
        this.channel = channel;
        this.client = client;
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
                length = random(6, 9)
            } break;
            case 3: {
                length = random(10, 15)
            } break;
        }
        try {
            word = (await axios.get('https://random-word-api.herokuapp.com/word?length=' + length)).data[0]
        } catch (error) {
            return
        }
        let embed = new EmbedBuilder().setTitle("Unscramble The Word").setDescription(word).setTimestamp().setColor(difficulty == 1 ? "Green" : difficulty == 2 ? "Yellow" : "Red")
        const value = Math.round(100 * ((length - 3) ** 0.75))
        embed.setFooter({ text: "Unscramble for " + value + "xp" })
        let message = await this.channel.send({ embeds: [embed] })
        let solved = false
        this.collector = this.channel.createMessageCollector({ time: 3600000 })
        this.collector.on('collect', async msg => {
            if (msg.content.toLowerCase() == word.toLowerCase()) {
                let user = new GuildMemberManager(data.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id))
                user.addXP(value)
                user.addWallet(10)
                embed.setFields([{ name: "Answer", value: word, inline: true }])
                    .setTitle(`${msg.author.displayName} unscrambled the word.`)
                    .setFooter({ text: "Unscrambled for " + value + "xp" })
                    .setColor("NotQuiteBlack")
                message.edit({ embeds: [embed] })
                let rewardMsg = await msg.channel.send(`<@${msg.author.id}> unscrambled the word.`)
                solved = true
                setTimeout(() => {
                    if (msg.deletable) msg.delete()
                    rewardMsg.delete()
                }, 20000)
                if (this.collector) this.collector.stop();
            }
        })
        this.collector.on('end', () => {
            if (!solved) {
                embed.setFooter({ text: "Unscramble for " + value + "xp" })
                    .setFields([{ name: "Answer", value: word, inline: true }])
                    .setColor("NotQuiteBlack")
                message.edit({ embeds: [embed] })
            }
        });
    }
    end() {
        if (this.collector) this.collector.stop();
    }
}
export class games {
    client: Client;
    channel: string;
    game: mathGame | triviaGame | scrambleGame | undefined;
    constructor(client: Client, channel: string) {
        this.channel = channel;
        this.client = client;
    }
    init() {
        if (this.game) this.game.end()
        let randomNum = random(1, 3)
        let channel = this.client.channels.cache.get(this.channel)
        if (channel instanceof TextChannel) {
            switch (randomNum) {
                case 1: {
                    console.log("math")
                    this.game = new mathGame(this.client, channel)
                    this.game.init()
                } break;
                case 2: {
                    console.log("trivia")
                    this.game = new triviaGame(this.client, channel)
                    this.game.init()
                } break;
                default: {
                    console.log("unscramble")
                    this.game = new scrambleGame(this.client, channel)
                    this.game.init()
                } break;
            }
        }
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