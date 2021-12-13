require('dotenv').config();
const {Listener} = require('@sapphire/framework');
const Relay = require('../relay');
const minResponseChance = 1;
const maxResponseChance = parseInt(process.env.MAX_RESPONSE_CHANCE);
const botUserId = process.env.BOT_USER_ID;

class MessageCreationListener extends Listener {
	constructor(context, options) {
		super(context, {
			...options, event: 'messageCreate'
		});
	}

	async run(message) {
		let authorId = message.author.id;
		if(authorId === botUserId) {
			return false;
		}
		console.log("Message received.");
		let botPinged = false;
		if(message.mentions !== []) {
			if(message.mentions.users.has(botUserId)) {
				botPinged = true;
			}
		}
		let randomChance = Math.floor(Math.random() * (maxResponseChance - minResponseChance + 1) + minResponseChance);
		let messageContent = message.content;
		let channelId = message.channelId;
		messageContent = messageContent.replace("<@!" + botUserId + "> ", '')
		let usersName = message.author.username;
		if(botPinged || randomChance === maxResponseChance) {
			let response = await Relay.relayMessage(messageContent,usersName, channelId, true);
			if(response === '') {
				response =
					"Ah!! You're unlucky, I was activated by your message but no AI response was given... You've now got 1 minute worth of bad luck :(";
			}
			console.log([
										'responding with',
										response]);

			return message.reply(response);
		} else {
			console.log('adding message into prompt history and not requesting a response.');
			await Relay.relayMessage(messageContent, usersName, channelId, false);
		}
	}
}

module.exports = {
	MessageCreationListener
};