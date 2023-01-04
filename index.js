const { Client, GatewayIntentBits, Events, ChannelType, ActivityType } = require('discord.js');
const fetch = require('node-fetch').default;
const config = require('./config.json');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
    ]
});

client.on(Events.ClientReady, () => {
    console.log(`[ CLIENT ] : ${client.user.tag} is online!`);
    client.user.setPresence({ 
            activities: [{ 
            name: 'Honkai Impact 3rd',
            type: ActivityType.Playing
        }], 
        status: 'dnd'
    });
});

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.type !== ChannelType.GuildText) return;
    if (message.channel.name !== config.channelName) return;
    if (message.author.bot) return;
    message.channel.sendTyping();
    const content = await chatBot(message.content, config.modelName, process.env.HUGGINGFACE_TOKEN)
    message.channel.send(content)
});

client.login(process.env.DISCORD_TOKEN);

async function chatBot(input, model, huggingFaceToken) {
    const payload = {
        inputs: {
            text: input
        }
    };
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Authorization': 'Bearer ' + huggingFaceToken }
    });
    const data = await response.json();
    let botResponse = '';
    if (data.hasOwnProperty('generated_text')) {
        botResponse = data.generated_text;
    } else if (data.hasOwnProperty('error')) {
        botResponse = data.error;
    }
    return botResponse;
}