require('dotenv').config();

const axios = require('axios').default;
const chatContextHandler = require('./chatContextHandler');
const regex = /(Human:|Missy:)\s([\s\S]*?)(?=Human:|Missy:|$)/g;
const url = process.env.GOOGLE_API_URL;
const maxLines = parseInt(process.env.MAX_NUMBER_OF_PROMPT_LINES);
const basePromptLength = parseInt(process.env.BASE_PROMPT_LENGTH);
const config = {
	headers: {
		"Content-Type": "application/json"
	}
}
let data = {
	"contents": [],
	"safetySettings": [
		{
			"category": "HARM_CATEGORY_DANGEROUS_CONTENT",
			"threshold": "BLOCK_NONE"
		}
	],
};

class Relay_Google {
	static async relayMessage(message, userName, channelId, callApi = false) {
		//Get or create new file.
		let currentChatContext = chatContextHandler.getFile(channelId);
		data.contents = [];
		if(currentChatContext === undefined) {
			currentChatContext = '';
		}
		if(message.trim() === '') {
			return 'message empty!';
		}
		if(message.trim() === 'test') {
			callApi = false
		}
		currentChatContext = currentChatContext + "\nHuman: " + message.replace(/\r?\n/g, ' ')
		let promptLines = currentChatContext.split('\n');
		if(promptLines.length > (maxLines)) {
			console.log([
										"Removing Lines:",
										((promptLines.length) - maxLines)])
			promptLines.splice(basePromptLength, ((promptLines.length - basePromptLength) - maxLines));
			currentChatContext = promptLines.join('\n');
		}
		data.contents.push({
												 "role": "model", "parts": [{"text": chatContextHandler.basePrompt}]
											 });
		let match;
		while ((match = regex.exec(currentChatContext)) !== null) {
			let role;
			if(match[1] === 'Human:') {
				role = 'user'
			} else {
				role = 'model'
			}
			if(match[2].trim() !== '') {
				data.contents.push({
														 "role": role, "parts": [{"text": match[2].trim()}]
													 })
			}
		}

		if(!callApi) {
			chatContextHandler.saveFile(channelId, currentChatContext);
			console.log(JSON.stringify(data));
			return null;
		}

		var errorMsg = '';
		const result = await axios.post(url, data, config).catch(function (error) {
			console.log(JSON.stringify(error));
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log(error.response.data);
				console.log(error.response.status);
				console.log(error.response.headers);
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				console.log(error.request);
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log('Error', error.message);
			}
			console.log(error.config);

			errorMsg = error.message;
		})

		if(errorMsg !== '') {
			return errorMsg;
		}

		let returnMessage = '';

		console.log(JSON.stringify(result.data));

		if(result.data.candidates[0].content.parts[0].text !== '') {
			console.log({'choices': result.data.candidates[0].content.parts[0].text});
			currentChatContext = currentChatContext + "\nMissy: " + result.data.candidates[0].content.parts[0].text.replace(/\r?\n/g, ' ').trim();
			returnMessage = result.data.candidates[0].content.parts[0].text;
		} else {
			console.log({'returned choices': result.data.choices});
			console.log({'returned errors': result.data.error});
			returnMessage = chatContextHandler.emptyResponseMessage;
		}
		chatContextHandler.saveFile(channelId, currentChatContext);

		return returnMessage;
	}
}

module.exports = Relay_Google;