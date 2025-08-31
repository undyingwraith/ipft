import { type Libp2pInit } from 'libp2p';

export const ILibp2pConfigSymbol = Symbol.for('ILibp2pConfig');

export interface ILibp2pConfig extends Libp2pInit {
}
