export type NeosMessageRequestParams = {
	maxItems?: number;
	user?: string;
	unread?: boolean;
	fromTime?: string;
};

export enum MessageType {
	Text = 'Text',
	Object = 'Object',
	Sound = 'Sound',
	SessionInvite = 'SessionInvite',
	CreditTransfer = 'CreditTransfer',
	SugarCubes = 'SugarCubes'
}

export type NeosMessage<T> = {
	id: string;
	ownerId: string;
	recipientId: string;
	senderId: string;
	messageType: MessageType;
	content: T;
	sendTime: Date;
	lastUpdateTime: Date;
	readTime: Date;
};

export type NeosObject = {
	id: string;
	ownerId: string;
	assetUri: string;
	globalVersion: string;
	localVersion: string;
	lastModifyingUserId: string;
	lastModifyingMachineId: string;
	name: string;
	recordType: string; //Usually object
	ownerName: string;
	tags: string[];
	path: string;
	thumbnailUri: string;
	isPublic: boolean;
	isForPatrons: boolean;
	isListed: boolean;
	lastModificationTime: Date;
	creationTime: Date;
	firstPublishTime: Date;
	// This is incomplete but the rest of the stuff isn't useful
};

export type TextMessage = NeosMessage<string> & {
	messageType: MessageType.Text;
};
export type ObjectMessage = NeosMessage<NeosObject> & {
	messageType: MessageType.Object;
};

export type UnknownMessage = NeosMessage<any>;
