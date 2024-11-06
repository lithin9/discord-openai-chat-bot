require('dotenv').config();

const axios = require('axios').default;
const chatContextHandler = require('./chatContextHandler');
const key = process.env.TEXTCORTEX_API_KEY;
const url = process.env.TEXTCORTEX_API_URL;
const maxLines = parseInt(process.env.MAX_NUMBER_OF_PROMPT_LINES);
const basePromptLength = parseInt(process.env.BASE_PROMPT_LENGTH);
const config = {
	headers: {
		"Content-Type": "application/json"
	}
}
let data = {
	"template_name": "auto_complete",
	"prompt": {
		"original_sentence": "It was a great day at cortex HQ"
	},
	"temperature": 0.65,
	"word_count": 20,
	"n_gen": 2,
	"source_language": "en",
	"api_key": key
};

class Relay_TextCortex {
	static async relayMessage(message, userName, channelId, callApi = false) {
		//Get or create new file.
		let currentChatContext = chatContextHandler.getFile(channelId);
		data.prompt.original_sentence = chatContextHandler.basePrompt;
		if(currentChatContext === undefined) {
			currentChatContext = '';
		}
		if(message === '') {
			return null;
		}
		currentChatContext = currentChatContext + "\nHuman: " + message.trim();
		let promptLines = currentChatContext.split('\n');
		if(promptLines.length > (maxLines)) {
			console.log([
										"Removing Lines:",
										((promptLines.length) - maxLines)])
			promptLines.splice(basePromptLength, ((promptLines.length - basePromptLength) - maxLines));
			currentChatContext = promptLines.join('\n');
		}
		data.prompt.original_sentence = data.prompt.original_sentence + currentChatContext;
		while (data.prompt.original_sentence.includes("\n\n")) {
			data.prompt = data.prompt.original_sentence.replace("\n\n", "\n");
		}
		/*console.log([
									'Current Data Prompt:',
									data.prompt]);*/
		if(!callApi) {
			chatContextHandler.saveFile(channelId, data.prompt);
			return null;
		}
		let sentDataPrompt = data.prompt.original_sentence;
		data.prompt.original_sentence = data.prompt.original_sentence + "\nMissy:";
		//console.log(data);
		console.log("WOW WE ARE POSTING!");
		const result = await axios.post(url, data, config);
		let returnMessage = '';
		if(result.isAxiosError === true) {
			console.log({'error message': result.data.error});
			returnMessage = "Wow you broke it.";
		} else if(result.data.choices[0].text !== '') {
			console.log({'choices': result.data.choices});
			sentDataPrompt = sentDataPrompt + "\nMissy: " + result.data.choices[0].text.trim();
			returnMessage = result.data.choices[0].text;
		} else {
			console.log({'returned choices': result.data.choices});
			console.log({'returned errors': result.data.error});
			sentDataPrompt = sentDataPrompt + "\nMissy: " + chatContextHandler.emptyResponseMessage;
			returnMessage = chatContextHandler.emptyResponseMessage;
		}
		chatContextHandler.saveFile(channelId, sentDataPrompt);

		return returnMessage;
	}
}

module.exports = Relay_TextCortex;