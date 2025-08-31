import { ILibp2pProtocolHandler } from './ILibp2pProtocolHandler';

export class EchoLibp2pProtocolHandler implements ILibp2pProtocolHandler {
	public handle(data: any) {

	}

	public get protocol(): string {
		return '/x/echo';
	}
}
