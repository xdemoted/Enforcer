import { ActionRowBuilder, Client, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, TextChannel, GuildMember as DiscordGuildMember, InteractionCollector } from 'discord.js';
import axios from 'axios';
import data, { GuildMemberManager, MessageManager } from '../../data';
import { numberedStringArraySingle, random, stringMax, triviaData } from '../../utilities';
import { baseGame } from '../../gamemanager';
export default class trivia extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
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
            console.log("Trivia:", trivia.correctAnswer)
            this.collector = this.channel.createMessageComponentCollector({ time: 3600000, message: triviaMessage }).on('collect', async interaction => {
                let member = interaction.member
                if (interaction.customId == "trivia" && interaction instanceof StringSelectMenuInteraction && !answerers.includes(interaction.user.id) && member instanceof DiscordGuildMember) {
                    answerers.push(interaction.user.id)
                    if (interaction.values[0] == answerIndex.toString()) {
                        CorrectAnswerers.push(interaction.user.id)
                        this.emit('correctanswer', interaction, Math.round(trivia.difficulty == "easy" ? 100 : trivia.difficulty == "medium" ? 200 : 300) / CorrectAnswerers.length)

                        interaction.deferUpdate()
                        embed.addFields([{ name: numberedStringArraySingle('', CorrectAnswerers.length - 1), value: member.displayName, inline: true }])
                        triviaMessage.edit({ embeds: [embed], components: [row] })
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