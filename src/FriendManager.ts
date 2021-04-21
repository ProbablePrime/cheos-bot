import { createSignal } from 'strong-events';

import { CloudModuleManager } from './CloudModuleManager';
import { NeosUserCredentials } from './NeosUserCredentials';
import { NeosFriend, NeosFriendStatus } from './types/FriendTypes';

const defaultFriendManagerOptions = {
	autoAcceptFriendRequests: true
};

export type FriendManagerOptions = {
	autoAcceptFriendRequests?: boolean;
	updateInterval?: number;
};

export type FriendEvent = (friend: NeosFriend) => any;
export type FriendListEvent = (friend: NeosFriend[]) => any;

export class FriendManager extends CloudModuleManager {

	public lastStatusUpdate?: Date;

	// EVENTS \o/, see docs/events.md for why we're going this route.
	// tslint:disable-next-line:typedef
	public onFriendRequest = createSignal<FriendEvent>();

	// tslint:disable-next-line:typedef
	public onFriendAdded = createSignal<FriendEvent>();

	// tslint:disable-next-line:typedef
	public onFriendsUpdate = createSignal<FriendListEvent>();

	// Not implemented atm
	// tslint:disable-next-line:typedef
	public onFriendRemoved = createSignal<FriendEvent>();
	private readonly friends: Map<string, NeosFriend> = new Map<string, NeosFriend>();

	constructor(
		credentials: NeosUserCredentials,
		private readonly options: FriendManagerOptions = defaultFriendManagerOptions
	) {
		super(credentials);
	}

	public reset() {
		this.friends.clear();
		this.lastStatusUpdate = undefined;
	}

	public async update() {
		try {
			// Ok so, we're meant to send a timestamp from the Past? If we don't have one.. but I didn't quite get any results there so
			// We send a null value if we don't have one.
			const res = await this.agent()
				.get(this.path(this.credentials.getUserId(), 'friends'))
				.query({
					lastStatusUpdate: this.lastStatusUpdate
						? this.lastStatusUpdate
						: null
				});

			// Here we transform our incoming Neos array into a proper TypeScript thing
			// I should automate this, but the implementation details are not presented to the user so I can change them later.
			const newFriends: NeosFriend[] = this.transformBody(res.body);

			if (newFriends.length === 0) {
				return;
			}

			// This avoid inline ternaries, where I can
			let statusDate = this.lastStatusUpdate
				? this.lastStatusUpdate
				: new Date();

			// Loop through the new friends array, we set the last status update to the newest one that we have.
			// We're using a map for the actual friend listing which is kinda cool. Means we have has, set, get etc.
			newFriends.forEach(async (friend) => {
				if (
					friend.userStatus != undefined &&
					friend.userStatus.lastStatusChange > statusDate
				) {
					statusDate = friend.userStatus.lastStatusChange;
				}
				if (friend.friendStatus === NeosFriendStatus.Requested) {
					if (this.options.autoAcceptFriendRequests) {
						await this.acceptFriendRequest(friend);
					} else {
						this.onFriendRequest.invoke(friend);
					}
				}
				this.friends.set(friend.id, friend);
			});
			// Finally set this to our max date. Feels better than continually overriding it but meh.
			this.lastStatusUpdate = statusDate;
			this.onFriendsUpdate.invoke(Array.from(this.friends.values()));
		} catch (e) {
			this.onError(e);
		}
	}

	public async acceptFriendRequest(friend: NeosFriend) {
		friend.friendStatus = NeosFriendStatus.Accepted;
		friend.ownerId = this.getUserId();

		// This apparently just works? COOL?
		try {
			await this.agent()
				.put(
					this.path(
						this.credentials.getUserId() + '/friends/' + friend.id
					)
				)
				.send(friend);
			this.onFriendAdded.invoke(friend);
		} catch (e: any) {
			this.onError(e);
		}
	}

	public getFriendRequests(): NeosFriend[] {
		return Array.from(this.friends.values()).filter(
			(friend) => friend.friendStatus === NeosFriendStatus.Requested
		);
	}

	public getFriends(): IterableIterator<NeosFriend> {
		return this.friends.values();
	}
	public getFriend(id: string): NeosFriend | undefined {
		return this.friends.get(id);
	}

	public path(...parts: string[]): string {
		return super.path('users', ...parts);
	}

	private transformBody(body: NeosFriend[]) {
		return body.map((friend) => {
			friend.lastMessageTime = new Date(friend.lastMessageTime);
			friend.friendStatus = NeosFriendStatus[friend.friendStatus];
			if (friend.userStatus) {
				friend.userStatus.lastStatusChange = new Date(
					friend.userStatus.lastStatusChange
				);
			}

			return friend;
		});
	}
}
