const {Listener} = require('@sapphire/framework');
const {Permissions} = require('discord.js');
const chatContextHandler = require('../chatContextHandler');
const botUserId = process.env.BOT_USER_ID;

class ReadyListener extends Listener {
	constructor(context, options) {
		super(context, {
			...options, once: true, event: 'ready'
		});
	}

	run(client) {
		const {username, id} = client.user;
		client.channels.cache.forEach(function (value, key, map) {
			let channel = map.get(key);
			let channelId = value.id;
			if(channel.type === 'GUILD_TEXT') {
				let permissionCheck = new Permissions(channel.permissionsFor(botUserId));
				if(permissionCheck.has(Permissions.FLAGS.SEND_MESSAGES)
					 && permissionCheck.has(Permissions.FLAGS.READ_MESSAGE_HISTORY)
					 && permissionCheck.has(Permissions.FLAGS.VIEW_CHANNEL)) {
					if(value.messages !== undefined) {
						try {
							value.messages.fetch({limit: 45}).then(channelMessages => {
								let messageHistory = '';
								channelMessages.forEach(channelMessage => {
									let prefix = channelMessage.author.id === botUserId ? 'AI: ' : 'Human: ';
									let messageContent = channelMessage.content.replace("<@!" + botUserId + ">", '')
																										 .replace("<@" + botUserId + ">", '')
																										 .replace("\n", ' ')
																										 .trim();
									messageHistory = "\n" + prefix + messageContent + messageHistory;
								});
								messageHistory = chatContextHandler.basePrompt + messageHistory;
								chatContextHandler.saveFile(channelId, (messageHistory));

							});
						} catch(err) {
							console.log(err);
						}
					}
				}
			}
		});

		this.container.logger.info(`Successfully logged in as ${username} (${id})`);
	}
}

module.exports = {
	ReadyListener
};