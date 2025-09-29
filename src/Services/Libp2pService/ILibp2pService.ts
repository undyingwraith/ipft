import { Connection, DialOptions, PeerId } from '@libp2p/interface';

export const ILibp2pServiceSymbol = Symbol.for('ILibp2pService');

export interface ILibp2pService {
	/**
	 * Dial a new peer.
	 * @param id The id of the peer to dial.
	 * @param options Options that configure how the peer is dialed.
	 */
	dial(id: PeerId, options?: DialOptions): Promise<Connection>;
}
