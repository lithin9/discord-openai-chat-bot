require('dotenv').config();

const axios = require('axios').default;
const chatContextHandler = require('./chatContextHandler');
const key = process.env.OPENAI_API_KEY;
const url = process.env.OPENAI_API_URL;
const maxLines = parseInt(process.env.MAX_NUMBER_OF_PROMPT_LINES);
const config = {
	headers: {
		"Content-Type": "application/json",
		"Authorization": "Bearer " + key
	}
}
let data = {
	"model": "davinci:2020-05-03",
	"prompt": "",
	"temperature": 0.85,
	"max_tokens": 54,
	"top_p": 1,
	"best_of": 1,
	"frequency_penalty": 0,
	"presence_penalty": 0,
	"stop": ["\n"]
};

class Relay {
	static async relayMessage(message, userName, channelId, callApi = false) {
		data.prompt = "The following is a conversation with an AI assistant named Missy. Missy, the assistant, is helpful, creative, clever, and very friendly.\n\n";
		//Get or create new file.
		let currentChatContext = chatContextHandler.getFile(channelId);
		if(currentChatContext === undefined) {
			currentChatContext = '';
		}
		currentChatContext = currentChatContext + userName + ": " + message + "\n"
		let promptLines = currentChatContext.split('\n');
		if(promptLines.length > (maxLines)) {
			console.log(["Removing Lines:", (promptLines.length - maxLines)])
			promptLines.splice(0, (promptLines.length - maxLines));
			currentChatContext = promptLines.join('\n');
		}
		data.prompt = data.prompt + currentChatContext;
		console.log(['Current Data Prompt:', data.prompt]);
		if(!callApi) {
			chatContextHandler.saveFile(channelId, data.prompt);
			return null;
		}
		const result = await axios.post(url, data, config);
		if(result.data.choices[0].text !== '') {
			data.prompt = data.prompt + "Missy: " + result.data.choices[0].text + "\n";
		}
		chatContextHandler.saveFile(channelId, data.prompt);

		return result.data.choices[0].text;
	}
}

module.exports = Relay;