Bot works by taking up to the last 45 lines of text (per channel) that it has witnessed and sends it to the OpenAI API for a response. It will
respond when directly mentioned or if it hits the 5% chance to respond.


To run this in oracle's servers (after installing the proper shit (node16, and then running node install in the base directory of this project)
run the command: nohup node bot.js &
then run disown
now it should log in within a few seconds and begin recording conversation context.