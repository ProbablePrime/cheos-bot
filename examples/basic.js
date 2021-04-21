
const {NeosBot} = require('./');

const bot = new NeosBot();

async function main() {
	await bot.login('BotBoop', 'Password');
	console.log('Starting');

	bot.messages.onNewMessage(message => {
		console.log(`New Message from: ${message.senderId}, of type: ${message.messageType}`);
		console.log(`Message contents: ${message.content}`);
	})

	bot.friends.onFriendAdded(friend => {
		console.log(`New Friend Added: ${friend.friendUsername}!`);
	})

	bot.onError(error => {
		console.log(error);
	})
}


main();
