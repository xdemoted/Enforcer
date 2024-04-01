import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, ComponentType, EmbedBuilder, Message, TextChannel } from "discord.js"
import { baseGame } from "../../gamemanager"
import data from "../../data";
export default class button extends baseGame {
    constructor(client: Client, channel: TextChannel) {
        super(client, channel)
    }
    async init() {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('click')
                    .setLabel(`Don't Touch`)
                    .setStyle(ButtonStyle.Primary)
            );
        this.message = await this.channel.send({ content: 'Its a button, it does things... I think?', components: [row] });
        this.collector = this.channel.createMessageComponentCollector({ time: 3600000, filter: i => (i.customId === 'click'&& (this.message as Message).id == i.message.id), componentType: ComponentType.Button, });
        this.collector.on('collect', async i => {
            let outcome = Math.random()
            let guild = data.getGuildManager(i.guildId)
            switch (true) {
                case outcome<=0.05:
                    i.reply({ content: 'With the click of the button your soul feels sapped of a great amount of knowledge.', ephemeral: true });
                    guild.getMemberManager(i.user.id).removeXP(1000)
                    break;
                case outcome<=0.1:
                    i.reply({ content: 'An audible click rings as you feel xp forcefully stuffed down your throat.', ephemeral: true });
                    guild.getMemberManager(i.user.id).addXP(1000)
                    break;
                case outcome<=0.3:
                    i.reply({ content: 'As the click sounds, you feel a sudden numbness as if experience was sapped from your soul.', ephemeral: true });
                    guild.getMemberManager(i.user.id).removeXP(105)
                    break;
                    case outcome<=0.5:
                        i.reply({ content: 'With the click of the button your soul heavy with newfound knowledge', ephemeral: true });
                        guild.getMemberManager(i.user.id).addXP(100)
                        break;
                    case outcome<=0.85:
                            i.reply({ content: 'With the click of the button your soul heavy with newfound knowledge', ephemeral: true });
                            guild.getMemberManager(i.user.id).addXP(500)
                            break;
                default:
                    i.reply({ content: 'As the button clicks, your brain becomes foggy, as if you forgot experiences of your past.', ephemeral: true });
                    guild.getMemberManager(i.user.id).removeXP(500)
                    break;
            }
        })
    }
    end() {
        if (this.collector) this.collector.stop();
        if (this.message&&this.message.deletable) this.message.delete();
    }
}