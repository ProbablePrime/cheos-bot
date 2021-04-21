# cheos-bot Library

**This is a very, early pre-release, stuff may break and you may scratch your head.**

A very small, subset of Neos' HTTP APIs, which are enough to make a small Neos Bot. It can't really do much right now. But It can do what I need it to do. If you'd like to suggest features please let me know by opening an issue.


## Usage

### Install cheos-bot

```bash
npm i --save @probableprime/cheos-bot
```

### Use cheos-bot

```javascript

const {NeosBot} = require('@probableprime/cheos-bot');

const bot = new NeosBot();

async function main() {
    await bot.login('Bot', 'Boop');
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
```

### Docs

TODO

## Notes

Things might seem a little weird here, that's because it is. This is a very **early** look at a how I would write this kind of module and I'm still figuring stuff out.

## Design Principles

I have some random design principles at play here:

1. Do only what is needed. Cheos doesn't aim to implement the entirety of Neos' APIs
1. TypeScript. TypeScript provides confidence and clarity for developers and eventually... docs.
1. Newest JavaScript / Node features. We're in 2021. We use classes, maps, async/await and whatever else.
1. Segregated Functionality, Avoiding a [God Object](https://en.wikipedia.org/wiki/God_object) Lets me Write Faster
   1. Yeah I know NeosBot is a god Object, but its just wrapped for simplicity. It doesn't actually make any requests.
1. Signals vs Event Emitters see [Events](docs/events.md) for more info. I'm still not sure about this one.
1. Make it easy. No one has time for this

## Known Issues

- Error Handling is terrible... Like really bad... Half the time I don't even handle them.
- Failure states, retries and cascade failures can happen
- See [Events](docs/events.md)
- No Tests
- No Docs
- Incomplete (V0.1.0) means basically nothing in the grand scheme of things
