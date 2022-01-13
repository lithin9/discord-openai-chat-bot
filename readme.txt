Bot works by taking up to the last ## (amount defined in .env) lines of text (per channel) and sends it to the OpenAI API for a response.
It will respond when directly mentioned or if it hits the 5% (can be changed in .env) chance to respond.


To run this in oracle's servers (after installing the proper shit (node16, and then running node install in the base directory of this project)
run the following command in the base directory: nohup node bot.js &
then run disown
now it should log in within a few seconds and begin recording conversation context.

You can tail the output with tail -f nohup.out


to restart it simply run ps -ef to find the nohup process then kill it and run the command again. kill <process id>

You can also run it with ndemon. To install nodemon type sudo npm install -g nodemon. To run it type nohup nodemon bot.js &
run disown
Then it should restart the application automatically when you make changes.