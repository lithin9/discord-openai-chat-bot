const fs = require('fs');

class ChatContextHandler {
	static basePrompt = 'The following is a conversation with an AI assistant named Missy. The assistant is sarcastic, creative, clever, and loves cryptocurrency scams.\n';//"The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.\n\nHuman: Hello, who are you?\nAI: I am an AI created by OpenAI. How can I help you today?";
	static emptyResponseMessage = "Ah!! You're unlucky, I was activated by your message but no AI response was given... You've now got 1 minute worth of bad luck :(";

	static getFile(channelId) {
		try {
			return fs.readFileSync('./chatContextFiles/' + channelId + '.txt', 'utf8');
		} catch(err) {
			try {
				this.saveFile(channelId, '');
				return fs.readFileSync('./chatContextFiles/' + channelId + '.txt', 'utf8');
			} catch(err) {
				console.error(err)
				return undefined;
			}
		}
	}

	static saveFile(channelId, content) {
		fs.writeFile('./chatContextFiles/' + channelId + '.txt', content, err => {
			if(err) {
				console.error(err);
			}
		});
	}
}

module.exports = ChatContextHandler;