export const ILibp2pProtocolHandlerSymbol = Symbol.for('ILibp2pProtocolHandler');

export interface ILibp2pProtocolHandler {
	/**
	 * Returns the name of the protocol.
	 */
	get protocol(): string;

	//TODO: correct typing
	handle(data: any): void | Promise<void>;
}
