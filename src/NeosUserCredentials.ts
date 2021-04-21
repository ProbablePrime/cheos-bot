// tslint:disable-next-line:no-require-imports
import request = require('superagent');

const API_BASE = 'https://www.neosvr-api.com/api/';
const SESSION_BASE = `${API_BASE}userSessions`;

export type NeosCredentials = {
	userId: string;
	token: string;
	created: Date;
	expire: Date;
	rememberMe: boolean;
	secretMachineId: string;
};

export class NeosUserCredentials {

	public agent: request.SuperAgentStatic & request.Request = this.createAgent();
	private credentials?: NeosCredentials;

	public async login(username: string, password: string): Promise<void> {
		const params = {
			Username: username,
			Password: password,
			SecretMachineId: 'potato',
			RememberMe: true
		};
		const res = await this.agent.post(SESSION_BASE)
			.send(params);

		//TODO: How do we transform this?
		const obj = res.body;
		this.credentials = {
			userId: <string> obj.userId,
			token: <string> obj.token,
			created: new Date(obj.created),
			expire: new Date(obj.expire),
			rememberMe: <boolean> obj.rememberMe,
			secretMachineId: <string> obj.secretMachineId
		};
		this.agent = this.createAgent();
	}

	public async logout(): Promise<void> {
		if (this.credentials === undefined) {
			return;
		}
		await this.agent.delete(`${SESSION_BASE}/${this.credentials.userId}/${this.credentials.token}`);
		this.credentials = undefined;
		this.agent = this.createAgent();

		return;
	}

	public isLoggedIn(): boolean {
		if (this.credentials === undefined) {
			return false;
		}

		return this.credentials.expire > new Date();
	}

	public getAuthHeader(): undefined | string {
		if (this.credentials === undefined) {
			return;
		}

		return `neos ${this.credentials.userId}:${this.credentials.token}`;
	}
	public getUserId(): string {
		if (!this.credentials) { return ''; }

		return this.credentials.userId;
	}

	public createAgent() {
		const agent = request.agent();
		const auth = this.getAuthHeader();
		if (auth) {
			agent.set('Authorization', auth);
		}

		return agent;
	}
}
