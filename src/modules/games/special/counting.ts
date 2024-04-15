import { Client, TextChannel } from 'discord.js';
import data, { CacheData, DataManager } from '../../data';

export default class countChannel {
    client: Client;
    message: string = ''
    channel: string = ''
    prompt: string[] = [];
    answer: string = '';
    open: boolean = true;
    startTime: number = Date.now();
    data: DataManager;
    constructor(client: Client, channel: string) {
        this.client = client
        this.channel = channel
        this.data = data
        this.init()
    }
    async init() {
        let channel = this.client.channels.cache.get(this.channel)
        if (channel&&channel instanceof TextChannel) {
            let guild = data.getGuildManager(channel.guild.id)
            let currentCount = guild.guild.count
            if (currentCount == 0) {
                let lastMessage = channel.messages.cache.last()
                if (lastMessage&&parseInt(lastMessage.content) > 0) {
                    currentCount = parseInt(lastMessage.content)
                }
            }
            channel.createMessageCollector().on('collect', async (msg) => {
                if (parseInt(msg.content) == currentCount + 1) {
                    currentCount++
                    msg.react('✅')
                    console.log(guild.guild.count)
                } else {
                    msg.react('❌')
                }
            })
        }
    }   

}