import { ServiceMap } from '@libp2p/interface';
import { type Libp2pInit } from 'libp2p';

export const ILibp2pConfigSymbol = Symbol.for('ILibp2pConfig');

export interface ILibp2pConfig<T extends ServiceMap = ServiceMap> extends Omit<Libp2pInit<T>, 'start' | 'datastore' | 'privateKey'> {
}
