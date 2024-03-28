import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, ComponentType, EmbedBuilder, GuildMember, MessageComponentInteraction, User } from "discord.js";
import { BaseUserManager, DataManager, GlobalUser, GuildManager, GuildMemberManager, UserManager, GuildMember as GMember } from "../data";
import { Canvas, loadImage } from "canvas";
import { createNameCard, getLeaderCard } from "../utilities";
import { baseCommand, commandData } from "../commands";

export default class leaderboard extends baseCommand {
    static command = {
        name: "leaderboard",
        description: "View the top 10 users on the leaderboard",
    }
    client: Client;
    data: DataManager;
    memberManager: GuildMemberManager;
    user: GMember;
    serverManager: GuildManager;
    constructor(commandData: commandData) {
        super(commandData)
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('gem')
                    .setLabel('Gems'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('gxp')
                    .setLabel('Global XP'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('cur')
                    .setLabel('Coins'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('lxp')
                    .setLabel('Local XP')
            ])
        let msg = await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('Preview').setDescription('This is a preview').setColor('DarkButNotBlack')], components: [row] })
        let update = async (id: 'gem' | 'gxp' | 'lxp' | 'cur', int?: MessageComponentInteraction) => {
            let title = '';
            let sortData: ((user: GMember | GlobalUser) => number) = () => { return 0 }
            let sorter = (a: GMember | GlobalUser, b: GMember | GlobalUser) => { return sortData(b) - sortData(a) }
            let list
            switch (id) {
                case 'gem':
                    title = 'Gems Leaderboard'
                    //@ts-ignore
                    sortData = (user) => { return (user.gems != undefined) ? user.gems : -1 }
                    list = this.data.getGlobalUsers()
                    break;
                case 'gxp':
                    title = 'Global XP Leaderboard'
                    //@ts-ignore
                    sortData = (user) => { return (user.gems != undefined) ? user.xp : -1 }
                    list = this.data.getGlobalUsers()
                    break
                case 'lxp':
                    title = 'XP Leaderboard'
                    //@ts-ignore
                    sortData = (user) => { return (user.guildID != undefined) ? user.xp : -1 }
                    list = this.memberManager.guild.members
                    break;
                case 'cur': {
                    title = 'Coins Leaderboard';
                    //@ts-ignore
                    sortData = (user) => { return (user.guildID != undefined) ? user.balance.wallet + user.balance.bank : -1 }
                    list = this.memberManager.guild.members
                    break;
                }
                default: {
                    return;
                }
            }
            list.sort(sorter)
            let userList: (GuildMember | User)[] = []
            for (let i = 0; i < 12; i++) {
                let userData = list[i]
                if (userData) {
                    let user: GuildMember | User | undefined
                    try {
                        user = await interaction.guild?.members.fetch(userData.id)
                    } catch (error) { }
                    try {
                        if (!user) user = await this.client.users.fetch(userData.id)
                    } catch (error) { }
                    if (!user) continue;
                    userList.push(user)
                    //let field: EmbedField = { name: numberedStringArraySingle((user instanceof GMember || user instanceof User) ? user.displayName : userData.id, i), value: sortData(userData).toString(), inline: true }
                    //users.push(field)
                }
            }
            let attachment = new AttachmentBuilder((await getLeaderCard(userList, 1, this.data)).toBuffer('image/png'), { name: 'leaderboard.png' })
            interaction.editReply({ embeds: [new EmbedBuilder().setTitle(title).setColor('DarkButNotBlack').setImage(`attachment://leaderboard.png`)], files: [attachment] })
        }
        update('lxp')
        msg.createMessageComponentCollector({ componentType: ComponentType.Button }).on('collect', async int => {
            update(int.customId as 'gem' | 'gxp' | 'lxp' | 'cur', int)
        })
        return false
    }
}