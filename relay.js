require('dotenv').config();

const axios = require('axios').default;
const chatContextHandler = require('./chatContextHandler');
const key = process.env.OPENAI_API_KEY;
const url = process.env.OPENAI_API_URL;
const maxLines = parseInt(process.env.MAX_NUMBER_OF_PROMPT_LINES);
const basePromptLength = parseInt(process.env.BASE_PROMPT_LENGTH);
const config = {
	headers: {
		"Content-Type": "application/json", "Authorization": "Bearer " + key
	}
}
let data = {
	//"model": "davinci:2020-05-03", // Not needed in Codex (to switch back change the env var url)  --- https://api.openai.com/v1/engines/code-davinci-001/completions
	"model": "ada",
	"prompt": "",
	"temperature": 0.90,
	"max_tokens": 50,
	"top_p": 1,
	"best_of": 1,
	"frequency_penalty": 0.95,
	"presence_penalty": 0.05,
	"stop": [
		"Human:",
		//"Missy:",
		"\n"]
};

class Relay {
	static async relayMessage(message, userName, channelId, callApi = false) {
		//Get or create new file.
		let currentChatContext = chatContextHandler.getFile(channelId);
		data.prompt = chatContextHandler.basePrompt;
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
		data.prompt = data.prompt + currentChatContext;
		while (data.prompt.includes("\n\n")) {
			data.prompt = data.prompt.replace("\n\n", "\n");
		}
		/*console.log([
									'Current Data Prompt:',
									data.prompt]);*/
		if(!callApi) {
			chatContextHandler.saveFile(channelId, data.prompt);
			return null;
		}
		let sentDataPrompt = data.prompt;
		data.prompt = data.prompt + "\nMissy:";
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

module.exports = Relay;