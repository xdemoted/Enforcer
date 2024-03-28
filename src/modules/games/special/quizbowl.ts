import axios from "axios";
import { Client, EmbedBuilder, TextChannel, InteractionCollector, CommandInteraction, AttachmentBuilder } from 'discord.js';
import data, { GuildMemberManager, MessageManager } from '../../data';
import { RunTimeEvents } from '../../RunTimeEvents';
import { cardDraw, isOdd, openChestGif, random } from '../../utilities';

export default class quizbowl {
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
        let embed = new EmbedBuilder().setTitle("Daily Quiz Bowl").setDescription(this.prompt[0]).setTimestamp().setColor("LuminousVividPink").setFooter({ text: 'Answer with /answer <answer>' })
        if (!(channel instanceof TextChannel)) return;
        let message = (await channel.send({ embeds: [embed] }))
        this.message = message.id
        console.log(this.answer)
        new RunTimeEvents().on('hour', (current) => {
            if (isOdd(current) && channel instanceof TextChannel) {
                let textMessage = channel.messages.cache.get(this.message)
                if (textMessage) {
                    i++
                    if (typeof this.prompt[i] == 'string') {
                        string += this.prompt[i] + "."
                        if (this.prompt[i].length < 10) {
                            i++
                            if (typeof this.prompt[i] == 'string') {
                                string += this.prompt[i] + "."
                            }
                        }
                        embed.setDescription(string)
                        textMessage.edit({ embeds: [embed] })
                    }
                }
            }
        })
        let users: { id: string, cd: number }[] = []
        let correctUsers: string[] = []
        let collector = new InteractionCollector(this.client as Client<true>, { channel: channel, time: 86400000, filter: (interaction) => interaction.isCommand() })
        collector.on('collect', async interaction => {
            if (interaction.isCommand() && (interaction as CommandInteraction).commandName == 'answer') {
                let command = interaction as CommandInteraction
                let answer = command.options.get('answer')?.value?.toString()
                let userCD = users.find(user => user.id == command.user.id)
                if (answer && (userCD == undefined || Date.now() - userCD.cd > 300000)) {
                    userCD ? userCD.cd = Date.now() : users.push({ id: command.user.id, cd: Date.now() })
                    let response = await this.checkanswer(answer)
                    if (correctUsers.includes(command.user.id)) command.reply({ content: 'You have already answered correctly.', ephemeral: true })
                    else {
                        let guild = data.getGuildManager(command.guildId ? command.guildId : '')
                        if (response == 'accept') {
                            correctUsers.push(command.user.id)
                            let reply = await command.deferReply()
                            let user = new GuildMemberManager(guild.getMember(command.user.id))
                            guild.addXP(2000)
                            user.addXP(2000, this.channel)
                            user.userManager.addXP(2000)
                            user.addWallet(100)
                            let gems = random(25, 50)
                            user.userManager.addGems(gems)
                            let card = cardDraw(true)
                            if (card) {
                                user.getUserManager().addCard(card.id)
                                let attachment = new AttachmentBuilder(await openChestGif(card.background, card.rank), { name: "chestopen.gif" })
                                let embed = new EmbedBuilder()
                                    .setTitle('Reward')
                                    .setDescription(`Lucky you! Received a "${card.title}" card!\n+${gems} gems, +${100} coins, +${2000} xp`)
                                    .setImage(`attachment://chestopen.gif`)
                                await command.editReply({ embeds: [embed], files: [attachment] })
                            } else {
                                await command.editReply(MessageManager.getMessage('rewards.dailyqb.correct', [command.user.id, 2000, 100, gems]))
                            }
                            setTimeout(() => {
                                if (reply) reply.delete()
                            }, 20000)
                        } else if (response == 'reject') {
                            let user = new GuildMemberManager(data.getGuildManager(command.guildId ? command.guildId : '').getMember(command.user.id))
                            guild.addXP(25)
                            user.addXP(25, this.channel)
                            user.userManager.addXP(25)
                            let rewardMsg = await command.reply({ content: MessageManager.getMessage('rewards.dailyqb.incorrect', [command.user.id, 25]), ephemeral: true })
                            setTimeout(() => {
                                rewardMsg.delete()
                            }, 20000)
                        } else if (response == 'prompt') {
                            command.reply({ content: 'Please check the prompt.\n*Specifics are not available when asked to prompt.*', ephemeral: true })
                            
                        } else {
                            command.reply({ ephemeral: true, content: `An error has likely occured.\nanswer reponse: ${response}` })
                            console.log(response)
                        }
                    }
                } else {
                    if (userCD) {
                        let time = Math.round((userCD.cd + 300000)/1000)
                        command.reply({ content: `You can answer again at <t:${time}:t>`, ephemeral: true })
                    }
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