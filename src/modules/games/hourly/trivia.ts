import { ActionRowBuilder, Client, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel, GuildMember as DiscordGuildMember, InteractionCollector, Attachment, AttachmentBuilder } from 'discord.js';
import axios from 'axios';
import data, { GuildMemberManager, MessageManager } from '../../data';
import { createGameCard, numberedStringArraySingle, random, stringMax, triviaData } from '../../utilities';
import { baseGame } from '../../gamemanager';
export default class trivia extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        let embed = new EmbedBuilder().setTitle("Trivia").setTimestamp().setColor("Green")
        if (this.channel instanceof TextChannel) {
            let difficulty = random(1, 3)
            const color: [number, number, number] = (difficulty == 1) ? [40, 180, 40] : (difficulty == 2) ? [180, 180, 40] : [180, 40, 40]
            let trivia: triviaData["data"][0]
            try {
                trivia = (await axios.get(`https://the-trivia-api.com/api/questions?limit=1&difficulty=${(difficulty == 1) ? 'easy' : (difficulty == 2) ? 'medium' : 'hard'}`)).data[0]
            } catch (error) {
                return console.log(error)
            }
            let answers = trivia.incorrectAnswers.concat(trivia.correctAnswer)
            answers = answers.sort(() => Math.random() - 0.5)
            let answerIndex = answers.indexOf(trivia.correctAnswer)
            let row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(
                    new StringSelectMenuBuilder().setCustomId("trivia").setPlaceholder("Select an answer").addOptions(answers.map((answer, index) => {
                        return { label: answer, value: index.toString() }
                    }))
                )
            let text = [
                '## &f' + trivia.question,
                `&f- &7${answers[0]}`,
                `&f- &7${answers[1]}`,
                `&f- &7${answers[2]}`,
                `&f- &7${answers[3]}`,
                '&f ',
                '{c}## &fUnanswered'
            ]
            const canvas = await createGameCard('&fAnswer The Trivia', text, { color: color })
            this.message = await this.channel.send({ files: [new AttachmentBuilder(canvas.toBuffer(),{name:'trivia.png'})], components: [row] })
            let answerers: String[] = []
            let CorrectAnswerers: String[] = []
            this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: this.message }).on('collect', async interaction => {
                let member = interaction.member
                if (interaction.customId == "trivia" && interaction instanceof StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof DiscordGuildMember) {
                    answerers.push(interaction.user.id)
                    if (interaction.values[0] == answerIndex.toString() && this.message) {
                        CorrectAnswerers.push(interaction.user.id)
                        this.emit('correctanswer', interaction, (100*difficulty))
                        interaction.deferUpdate()
                        if (text[text.length - 1] == '{c}## &fUnanswered') {
                            text.splice(text.length - 1, 1, `## &fCorrect Answerers`)
                            text.push(`&f- &7${member.displayName}`)
                        } else text.push(`&f- &7${member.displayName}`);
                        const canvas = await createGameCard('&fAnswer The Trivia', text, { color: color })
                        this.message.edit({ files: [new AttachmentBuilder(canvas.toBuffer(),{name:'trivia.png'})], components: [row] })
                    } else {
                        let user = new GuildMemberManager(data.getGuildManager(interaction.guildId ? interaction.guildId : '').getMember(interaction.user.id))
                        user.addXP(25, this.channel.id)
                        user.userManager.addXP(25)
                        let message = await interaction.reply({ content: MessageManager.getMessage('rewards.trivia.incorrect', [interaction.user.id, 25, trivia.correctAnswer]), ephemeral: true })
                        setTimeout(() => {
                            message?.delete()
                        }, 20000);
                    }
                }
            })
        }
    }
    end() {
        if (this.message && this.message.deletable) this.message.delete();
        if (this.collector) this.collector.stop();
    }
}