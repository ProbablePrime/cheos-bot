// TODO Move these to type files

export enum NeosFriendStatus {
	None = 'None',
	SearchResult = 'SearchResult',
	Requested = 'Requested',
	Ignored = 'Ignored',
	Blocked = 'Blocked',
	Accepted = 'Accepted'
}

export type NeosUserStatus = {
	onlineStatus: NeosUserOnlineStatus; //Online
	lastStatusChange: Date;

	currentSessionAccessLevel?: number;
	currentSessionHidden?: boolean;
	currentHosting?: boolean;

	compatibilityHash: string;
	neosVersion: string;

	publicRSAKey?: any;
	outputDevice?: string; //Screen
	isMobile?: boolean;
	activeSessions?: any;
};

export enum NeosUserOnlineStatus {
	Online = 'Online',
	Invisible = 'Invisible',
	Away = 'Away',
	Busy = 'Busy',
	Offline = 'Offline'
}

export type NeosFriend = {
	id: string;
	ownerId: string;
	friendUsername: string;
	friendStatus: NeosFriendStatus; //TODO FriendStatus
	isAccepted: boolean;
	userStatus: NeosUserStatus; // TODO UserStatus
	lastMessageTime: Date;
	profile: string; // TODO UserProfile
};
