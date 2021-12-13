const fs = require('fs');

class ChatContextHandler {
	static getFile(channelId) {
		try {
			return fs.readFileSync('./chatContextFiles/' + channelId + '.txt', 'utf8');
		} catch(err) {
			console.error(err)
			return undefined;
		}
	}

	static saveFile(channelId, content) {
		fs.writeFile('./chatContextFiles/' + channelId + '.txt', content, err => {
			if (err) {
				console.error(err);
			}
		});
	}
}

module.exports = ChatContextHandler;