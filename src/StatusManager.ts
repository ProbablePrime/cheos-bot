import { createSignal } from 'strong-events';

import { CloudModuleManager } from './CloudModuleManager';
import { NeosUserCredentials } from './NeosUserCredentials';
import { SignalEvent } from './types/Events';
import { NeosUserOnlineStatus, NeosUserStatus } from './types/FriendTypes';

export type StatusManagerOptions = {
	status: string;
};

const defaultStatusManagerOptions = {
	status: 'Cheese'
};

export class StatusManager extends CloudModuleManager {

	public onStatusUpdate = createSignal<SignalEvent<NeosUserStatus>>();
	private readonly status: NeosUserStatus = {
		onlineStatus: NeosUserOnlineStatus.Online,
		compatibilityHash: '',
		neosVersion: '',
		lastStatusChange: new Date()
	};

	constructor(
		credentials: NeosUserCredentials,
		private readonly options: StatusManagerOptions = defaultStatusManagerOptions
	) {
		super(credentials);
		this.status.compatibilityHash = this.status.neosVersion = this.options.status;
	}

	public reset() {}

	public async update() {
		this.status.lastStatusChange = new Date();
		await this.agent()
			.put(this.path(this.getUserId(), 'status'))
			.send(this.status);
		this.onStatusUpdate.invoke(this.status);
	}

	public path(...parts: string[]): string {
		return super.path('users', ...parts);
	}
}
