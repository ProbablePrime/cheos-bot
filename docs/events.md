# Events

You may be asking "So why are we using a weird, signally thing?", well that's because of TypeScript and me being paranoid about types.

In traditional, Node.js/JavaScript land you'd probably use the following sort of structure to make events work:

```javascript
export class Potato extends EventEmitter {
	constructor() {
		// Not needed, but shown for effect.
		super();
	}
	doThingResultingInAnEvent() {
		this.emit('A thing', {potato:true, a:1, b:2});
	}
}

const instance = new Potato();

instance.on('A thing', processThing => {
	//Whatever
});
```

I don't like this for a number of reasons:

- You're polluting my Hierarchy. Everything must extend from EventEmitter. This is generally ok but I like to be in full control of my hierarchy.
- String based event listening isn't self-documenting. I need to read the docs to know what events you're producing
- Types can miss-behave, I have no idea what the object sent to 'A thing' is.

Instead we're using "Signals", I'm not sure that's the official term here because its based on a [library](https://github.com/endel/strong-events#readme). The library just does, some TypeScript Gymnastics to get us an event list that we can use.

Its not that big but does have some problems.

There's one eventemitter instance per event type, this could get bloated but you could maybe re-write things to use a common object. Using [typed-event-emitter](https://www.npmjs.com/package/typed-event-emitter) seemed ok until i saw that the `emit` method was protected. I could probably PR this or Fork it, but I'm unsure of the implications. Take a look for me?

Regardless, using this library, produces cleaner events which solve my above problems. Here's how you use them.

```javascript
export type AThingType = {
	potato: boolean;
	a: number;
	b: number;
}
export class Potato {
	public onAThing = createSignal<AThingType>
	doThingResultingInAnEvent() {
		this.emit('A thing', {potato:true, a:1, b:2});
	}
}

const instance = new Potato();

instance.onAThing(obj:AThingType => {
	//TYPES
})
```

This ends up with slightly less typing that our original event emitter, and leaves no guesswork.

- No hierarchy pollution
- Self, documenting events. As in "ooo, what's instance.onPotatoAdded, I bet thats when it adds a potato. What types does that have. OH LOOK they're obvious".
- Consistent types

Now, I'm aware there are other, "Typed Events" solutions, and I understand that. This just happened to be the best thing that my 3am brain found. The developer of the module event links to a great article about the [][pros and cons of various structures](https://github.com/millermedeiros/js-signals/wiki/Comparison-between-different-Observer-Pattern-implementations).

Of course, because I'm publishing this thing on very little sleep. There's probably a better more TypeScripty / More "standard" way of doing this. That's fine. Open an Issue and we'll chat. Totally happy to make a breaking version change for this if you find something that's better. We should be able to maintain compatibility though with some additional gymnastics.

I was trying to model things on the [C# Events system](https://docs.microsoft.com/dotnet/csharp/programming-guide/events/) which is quite nice and resembles stuff you'll see if you write Neos Plugins or if you're playing around in the inspector.

For now though, I hope you'll be ok using this system. I like it for now.
