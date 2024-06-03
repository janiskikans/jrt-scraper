const { WebhookClient, EmbedBuilder } = require("discord.js");

/**
 * @param {string} message
 * @param {EmbedBuilder[]} embeds
 * @returns {Promise<void>}
 */
const sendMessage = async function (message, embeds = []) {
    const webhookClient = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL });

    await webhookClient.send({
        content: message,
        username: 'JRT Scraper',
        avatarURL: 'https://png.pngtree.com/png-clipart/20200225/original/pngtree-ticket-icon-flat-style-png-image_5252205.jpg',
        embeds,
    });
}

exports.sendMessage = sendMessage;