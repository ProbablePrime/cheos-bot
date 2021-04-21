//import {MessageManager} from './MessageManager';
import { createSignal } from 'strong-events/lib';
import { FriendManager } from './FriendManager';
import { MessageManager } from './MessageManager';
import { NeosUserCredentials } from './NeosUserCredentials';
import { StatusManager } from './StatusManager';
import { SignalEvent } from './types/Events';

export type NeosBotOptions = {
	autoAcceptFriendRequests: boolean;
	updateInterval: number;
	status: string;
	autoMarkRead: boolean;
	autoUpdate: boolean;
};

const defaultNeosBotOptions = {
	updateInterval: 5 * 1000,
	status: 'cheos-bot',
	autoAcceptFriendRequests: true,
	autoMarkRead: true,
	autoUpdate: true
};

export class NeosBot {
	public onError = createSignal<SignalEvent<Error>>();
	public friends = new FriendManager(this.credentials, this.options);
	public messages = new MessageManager(this.credentials, this.options);
	public status = new StatusManager(this.credentials, this.options);
	private readonly credentials = new NeosUserCredentials();
	private updateIntervalTimeout?: ReturnType<typeof setInterval>;

	constructor(public options: NeosBotOptions = defaultNeosBotOptions) {}
	public async login(username: string, password: string) {
		await this.credentials.login(username, password);
		if (this.options.autoUpdate) {
			this.start();
		}
	}
	public stop() {
		if (this.updateIntervalTimeout) {
			clearInterval(this.updateIntervalTimeout);
		}
	}

	public reset() {
		this.messages.reset();
		this.friends.reset();
		this.status.reset();
	}

	public async update() {
		// THE SHOW MUST GO ON!
		try {
			await this.status.update();
		} catch (e) {
			this.onError.invoke(e);
		}
		try {
			await this.friends.update();
		} catch (e) {
			this.onError.invoke(e);
		}
		try {
			await this.messages.update();
		} catch (e) {
			this.onError.invoke(e);
		}
	}

	private start() {
		this.updateIntervalTimeout = setInterval(
			this.update.bind(this),
			this.options.updateInterval
		);
	}
}
