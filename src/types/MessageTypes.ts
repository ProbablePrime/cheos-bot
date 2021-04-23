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

export enum TokenType {
	KFC = 'KFC',
	NCR = 'NCR'
}
export enum TransactionType {
	User2User = 'User2User',
	Withdrawal = 'Withdrawal',
	Deposit = 'Deposit',
	Tip = 'Tip'
}

export type NeosCreditTransfer = {
	token: TokenType;
	recipientId: string;
	amount: number;
	comment: string;
	transactionType: TransactionType
}

export type NeosMessageGeneric<T> = {
	id: string;
	ownerId: string;
	recipientId: string;
	senderId: string;
	messageType: MessageType;

	content: T;

	sendTime: Date;
	lastUpdateTime: Date;
	readTime: Date | undefined;
};

export type NeosSound = {};
export type NeosSessionInvite = {};
export type NeosSugarCubes = {};

export type NeosManifest = {hash:string, bytes:number}[];
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
	neosDDmanifest: NeosManifest;
	// This is incomplete but the rest of the stuff isn't useful
};

export type TextMessage = NeosMessageGeneric<string> & {messageType: MessageType.Text};
export type ObjectMessage = NeosMessageGeneric<NeosObject> & {messageType: MessageType.Object};
export type SoundMessage = NeosMessageGeneric<NeosSound> & {messageType: MessageType.Sound};
export type SessionMessage = NeosMessageGeneric<NeosSessionInvite> & {messageType: MessageType.SessionInvite};
export type CreditTransferMessage = NeosMessageGeneric<NeosCreditTransfer> & {messageType: MessageType.CreditTransfer};
export type SugarCubesMessage = NeosMessageGeneric<NeosSugarCubes> & {messageType: MessageType.SugarCubes};

export type SendableTextMessage = Pick<TextMessage, 'messageType' | 'content'>;
export type SendableObjectMessage = Pick<ObjectMessage, 'messageType' | 'content'>;
export type SendableSoundMessage = Pick<SoundMessage, 'messageType' | 'content'>;
export type SendableSessionMessage = Pick<SessionMessage, 'messageType' | 'content'>;
export type SendableCreditTransferMessage = Pick<CreditTransferMessage, 'messageType' | 'content'>;
export type SendableSugarCubesMessage = Pick<SugarCubesMessage, 'messageType' | 'content'>;

export type SendableMessage = SendableTextMessage | SendableObjectMessage | SendableSoundMessage | SendableSessionMessage | SendableCreditTransferMessage | SendableSugarCubesMessage;

export type UnknownMessage = NeosMessageGeneric<any>;

export type NeosMessage = TextMessage | ObjectMessage | SoundMessage | SessionMessage | CreditTransferMessage | SugarCubesMessage;
