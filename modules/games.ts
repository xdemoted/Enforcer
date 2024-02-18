import { ActionRowBuilder, Client, ColorResolvable, EmbedBuilder, MessageCollector, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel, ThreadChannel, GuildMember as DiscordGuildMember, InteractionCollector, ComponentType, ForumChannel } from 'discord.js';
import axios from 'axios';
import data, { GuildMember, GuildMemberManager, MessageManager } from './data';
import { RunTimeEvents } from './RunTimeEvents';
import { algGen, generateEquation, isOdd, isSqrt, maps, multiples, numberedStringArraySingle, random, stringMax, triviaData } from './utilities';
export type GameValues = { guildId: string, currentValue: string, reward: number, type: number }

function wordScramble(word: string) {
    let scrambledWord = "";
    const wordArray = word.split("");
    while (wordArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * wordArray.length);
        scrambledWord += wordArray.splice(randomIndex, 1)[0];
    }
    return scrambledWord;
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
        let difficulty = random(1, 4)
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
            default: {
                equation = algGen()
                color = "LuminousVividPink"
            }
                break;
        }
        let embed = new EmbedBuilder().setTitle("Solve the math problem.").setDescription(equation[0]).setTimestamp().setFooter({ text: "Solve for " + equation[1] + "xp" }).setColor(color)
        let answer = equation[1]
        if (this.channel instanceof TextChannel) {
            let message = await this.channel.send({ embeds: [embed] })
            this.collector = this.channel.createMessageCollector({ time: 3600000 })
            this.collector.on('collect', async msg => {
                if (msg.content.replace(/[^-0-9]/g, "") == answer.toString()) {
                    let reward = Math.round(answer * (1 - random(1, 4) * 0.05)) > 300 ? 300 : Math.round(answer * (1 - random(1, 4) * 0.05))
                    let gemReward = random(1, Math.ceil(reward / 100))
                    let user = new GuildMemberManager(data.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id))

                    user.addXP(reward, this.channel.id)
                    user.addWallet(10)
                    user.userManager.addGems(gemReward)

                    embed.setFields([{ name: "Answer", value: answer.toString(), inline: true }])
                        .setTitle(`${msg.member?.displayName} solved the problem.`)
                        .setFooter({ text: "Solved for " + ((Math.round(answer * (1 - random(1, 4) * 0.05)) > 300) ? 300 : Math.round(answer * (1 - random(1, 4) * 0.05))) + " xp" })
                    message.edit({ embeds: [embed] })
                    let rewardMsg = await msg.channel.send(MessageManager.getMessage('rewards.generic', [msg.author.id, reward, 10, gemReward]))
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
            console.log(trivia.correctAnswer)
            this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: triviaMessage }).on('collect', async interaction => {
                interaction.deferUpdate()
                let member = interaction.member
                if (interaction.customId == "trivia" && interaction instanceof StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof DiscordGuildMember) {
                    answerers.push(interaction.user.id)
                    if (interaction.values[0] == answerIndex.toString()) {
                        CorrectAnswerers.push(interaction.user.id)
                        let user = new GuildMemberManager(data.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id))
                        let reward = (trivia.difficulty == "easy" ? 100 : trivia.difficulty == "medium" ? 200 : 300) / CorrectAnswerers.length
                        let gemReward = random(1, Math.ceil(reward / 100))
                        user.addXP(reward, this.channel.id)
                        user.addWallet(10)
                        user.userManager.addGems(random(1, Math.ceil(reward / 100)))

                        embed.addFields([{ name: numberedStringArraySingle('', CorrectAnswerers.length - 1), value: member.displayName, inline: true }])
                        triviaMessage.edit({ embeds: [embed], components: [row] })
                        let message = await interaction.channel?.send(MessageManager.getMessage('rewards.generic', [interaction.user.id, reward, 10, gemReward]))
                        setTimeout(() => {
                            message?.delete()
                        }, 20000);
                    } else {
                        let message = await interaction.channel?.send(MessageManager.getMessage('rewards.trivia.incorrect', [interaction.user.id, trivia.correctAnswer]))
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
        if (this.collector) this.collector.stop();
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
        let scrambledWord = word
        while (word == scrambledWord) {
            scrambledWord = wordScramble(word)
        }
        let embed = new EmbedBuilder().setTitle("Unscramble The Word").setDescription(scrambledWord).setTimestamp().setColor(difficulty == 1 ? "Green" : difficulty == 2 ? "Yellow" : "Red")
        const value = Math.round(100 * ((length - 3) ** 0.75))
        embed.setFooter({ text: "Unscramble for " + value + "xp" })
        let message = await this.channel.send({ embeds: [embed] })
        let solved = false
        this.collector = this.channel.createMessageCollector({ time: 3600000 })
        this.collector.on('collect', async msg => {
            if (msg.content.toLowerCase() == word.toLowerCase()) {
                let user = new GuildMemberManager(data.getGuildManager(msg.guildId ? msg.guildId : '').getMember(msg.author.id))
                user.addXP(value, this.channel.id)
                user.addWallet(10)
                user.userManager.addGems(random(1, Math.ceil(value / 100)))
                embed.setFields([{ name: "Answer", value: word, inline: true }])
                    .setTitle(`${msg.member?.displayName} unscrambled the word.`)
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
        let randomNum = 1//random(1, 1)
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
export class blackjackThread {
    channel: ForumChannel
    player: GuildMember
    constructor(channel: ForumChannel, player: GuildMember) {
        this.channel = channel
        this.player = player
    }
    init() {
        let embed = new EmbedBuilder().setTitle("Welcome to Blackjack").setDescription("React with 🃏 to start the game.").setTimestamp().setColor("Green")
        this.channel.threads.create({ name: this.player.id, autoArchiveDuration: 1440, reason: "Blackjack", message: { content: "Welcome to Blackjack", embeds: [embed] } })
    }
}
export class dailyQB {
    client: Client;
    message: string = ''
    channel: string = ''
    prompt: string[] = [];
    answer: string = '';
    open: boolean = true;
    startTime: number = Date.now();
    constructor(client: Client, channel: string) {
        this.client = client
        this.channel = channel
        this.init()
    }
    async init() {
        console.log('qb')
        try {
            const response = await axios.get('https://qbreader.org/api/random-tossup/');
            let data = response.data;
            let prompt: Array<string> = response.data.tossups[0].question.split(".")
            if (prompt[prompt.length - 1] == "") {
                prompt.splice(prompt.length - 1, 1)
            }
            this.prompt = prompt
            this.answer = data.tossups[0].formatted_answer
        } catch (error) {
            console.log("error")
        }
        let channel = this.client.channels.cache.get(this.channel)
        let string = this.prompt[0]
        let i = 0
        let embed = new EmbedBuilder().setTitle("Daily Quiz Bowl").setDescription(this.prompt[0]).setTimestamp().setColor("LuminousVividPink")
        if (!(channel instanceof TextChannel)) return;
        this.message = (await channel.send({ embeds: [embed] })).id
        new RunTimeEvents().on('hour', (current) => {
            if (isOdd(current) && channel instanceof TextChannel) {
                let textMessage = channel.messages.cache.get(this.message)
                if (textMessage) {
                    i++
                    string += this.prompt[i]
                    embed.setDescription(string)
                    textMessage.edit({ embeds: [embed] })
                }
            }
        })

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