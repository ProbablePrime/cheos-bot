import { createSignal } from 'strong-events';

import { CloudModuleManager } from './CloudModuleManager';
import { NeosUserCredentials } from './NeosUserCredentials';
import { SignalEvent } from './types/Events';
import {
	MessageType,
	NeosCreditTransfer,
	NeosMessage,
	NeosMessageRequestParams,
	NeosObject,
	TokenType,
	TransactionType,
	UnknownMessage
} from './types/MessageTypes';

import {v4 as uuidv4} from 'uuid';

export type MessageListEvent = (message: NeosMessage<any>[]) => any;

export type MessageManagerOptions = {
	autoMarkRead: boolean;
};

const defaultMessageManagerOptions: MessageManagerOptions = {
	autoMarkRead: false
};

function isValidDate(d: Date) {
	return d instanceof Date && !isNaN(d.getTime());
}

export class MessageManager extends CloudModuleManager {

	public onNewMessage = createSignal<SignalEvent<UnknownMessage>>();
	public onMessageRead = createSignal<SignalEvent<string>>();

	private lastReadTime?: Date;
	private readonly messages: Readonly<Map<string, NeosMessage<any>>> = new Map<
		string,
		NeosMessage<any>
	>();

	constructor(
		credentials: NeosUserCredentials,
		private readonly options: MessageManagerOptions = defaultMessageManagerOptions
	) {
		super(credentials);
	}

	public reset() {
		this.messages.clear();
	}

	public isMessageRead(message: NeosMessage<any>): boolean {
		if (!message.readTime) {
			return false;
		}
		return isValidDate(message.readTime);
	}
	public isMessageSent(message: NeosMessage<any>): boolean {
		return message.senderId === message.ownerId;
	}

	public isMessageReceived(message: NeosMessage<any>): boolean {
		return message.recipientId === message.ownerId;
	}

	public async update(params: NeosMessageRequestParams = { unread: true }) {
		if (!params.fromTime) {
			if (this.lastReadTime) {
				params.fromTime = this.lastReadTime.toUTCString();
			}
		}
		if (!params.maxItems) {
			params.maxItems = -1;
		}
		try {
			const res = await this.agent()
				.query(params)
				.get(this.getReceivePath());
			if (res.status === 200) {
				this.lastReadTime = new Date();
			}
			const newMessages = this.transformBody(res.body);

			// This avoid inline ternaries, where I can
			let lastMessageDate = this.lastReadTime
				? this.lastReadTime
				: new Date();
			newMessages.forEach((message) => {
				if (
					message.lastUpdateTime &&
					message.lastUpdateTime > lastMessageDate
				) {
					lastMessageDate = message.lastUpdateTime;
				}
				if (message.senderId !== this.getUserId()) {
					this.messages.set(message.id, message);
					this.onNewMessage.invoke(message);
				}

				if (this.options.autoMarkRead) {
					this.markMessageRead(message.id);
				}
			});
			this.lastReadTime = lastMessageDate;
		} catch (e) {
			// So as this runs in a loop, we'll just need to back this off I guess?
			// https://github.com/connor4312/cockatiel maybe?
			this.onError.invoke(e);
		}
	}

	public getUnreadMessages() {
		return Array.from(this.messages.values()).filter(
			(message) => !message.readTime
		);
	}

	public async markMessagesRead(ids: string[]): Promise<void> {
		const res = await this.agent().patch(this.getReceivePath()).send(ids);
		if (res.status !== 200) {
			throw new Error(res.body);
		}
		ids.forEach((id) => {
			this.messages.delete(id);
			this.onMessageRead.invoke(id);
		});
	}
	public async markMessageRead(id: string): Promise<void> {
		return this.markMessagesRead([id]);
	}

	public async sendTextMessage(to: string, content: string) {
		return this.sendMessage<string>(to, MessageType.Text, content);
	}

	public async sendObject(to: string, obj: NeosObject) {
		return this.sendMessage<NeosObject>(to, MessageType.Object, obj);
	}

	public sendNCR(to: string, amount: number, comment: string = '') {
		return this.sendTransaction(to, TokenType.KFC,amount, comment);
	}

	public async sendKFC(to: string, amount: number, comment: string = '') {
		return this.sendTransaction(to, TokenType.KFC,amount, comment);
	}

	public async sendTransaction(to: string, token: TokenType, amount: number, comment: string) {
		const transfer:NeosCreditTransfer = {
			token,
			amount,
			comment,
			recipientId: to,
			transactionType: TransactionType.User2User
		}
		return this.sendMessage<NeosCreditTransfer>(to, MessageType.CreditTransfer, transfer);
	}

	private convertContent(content: any, type: MessageType): string {
		if (type === MessageType.Text) {
			return content;
		}
		return JSON.stringify(content);
	}
	// I'll re-write this I promise
	private async sendMessage<T>(to: string, type: MessageType, content: T): Promise<NeosMessage<T>> {
		const userId = this.getUserId();
		const messageDate = new Date();

		const message:NeosMessage<any> = {
			id: 'MSG-' + uuidv4(),
			senderId: userId,
			ownerId: userId,
			sendTime: messageDate,
			lastUpdateTime: messageDate,
			readTime: undefined,
			content: undefined,
			recipientId: to,
			messageType: type
		};
		message.content = this.convertContent(content, type);

		const res = await this.agent()
			.post(this.getSendPath(message.recipientId))
			.send(message);

		return res.body;
	}

	private getReceivePath() {
		return this.getSendPath(this.getUserId());
	}

	private getSendPath(userId: string) {
		return super.path('users', userId, 'messages');
	}

	private transformBody(messages: NeosMessage<any>[]): NeosMessage<any>[] {
		return messages.map<NeosMessage<any>>((message) => {
			message.lastUpdateTime = new Date(message.lastUpdateTime);
			message.sendTime = new Date(message.sendTime);
			if (message.readTime) {
				message.readTime = new Date(message.readTime);
			}

			if (message.messageType !== MessageType.Text) {
				message.content = JSON.parse(message.content);
			}

			return message;
		});
	}
}
