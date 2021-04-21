import { createSignal } from 'strong-events';

import { NeosUserCredentials } from './NeosUserCredentials';
import { SignalEvent } from './types/Events';

const API_ROOT = 'https://www.neosvr-api.com/api/';

export abstract class CloudModuleManager {
	// tslint:disable-next-line:typedef
	public onError = createSignal<SignalEvent<Error>>();

	protected credentials: NeosUserCredentials;

	constructor(credentials: NeosUserCredentials) {
		this.credentials = credentials;
	}

	public abstract update(): Promise<void>;
	public abstract reset(): void;

	public path(...parts: string[]): string {
		return API_ROOT + parts.join('/');
	}

	protected agent() {
		return this.credentials.agent;
	}

	protected getUserId(): string {
		return this.credentials.getUserId();
	}

}
