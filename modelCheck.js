require('dotenv').config();

const axios = require('axios').default;

const key = process.env.OPENAI_API_KEY;
const modelsURL = "https://api.openai.com/v1/models"
const config = {
	headers: {
		"Content-Type": "application/json", "Authorization": "Bearer " + key
	}
}
async function test() {
	const modelsResult = await axios.get(modelsURL, config);
	console.log(modelsResult.data.data[1]);
	for (const modelsResultKey in modelsResult.data) {
		//console.log(modelsResultKey.data)
	}
}

test()