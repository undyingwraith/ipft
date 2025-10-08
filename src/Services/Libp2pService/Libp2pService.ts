import { loadOrCreateSelfKey } from '@libp2p/config';
import { Connection, DialOptions, PeerId, PeerInfo } from '@libp2p/interface';
import { Multiaddr } from '@multiformats/multiaddr';
import { Signal } from '@preact/signals';
import { type ILogService, ILogServiceSymbol } from '@undyingwraith/jaaf-core';
import { MemoryDatastore } from 'datastore-core';
import { inject, injectable, multiInject, optional, preDestroy } from 'inversify';
import { createLibp2p, Libp2p } from 'libp2p';
import { ILibp2pProtocolHandler, ILibp2pProtocolHandlerSymbol } from '../Libp2pProtocolHandler';
import { type ILibp2pConfig, ILibp2pConfigSymbol } from './ILibp2pConfig';
import { ILibp2pService } from './ILibp2pService';

export const IDatastoreSymbol = Symbol.for('IDatastore');

@injectable()
export class Libp2pService implements ILibp2pService {
	constructor(
		@inject(ILogServiceSymbol) private readonly log: ILogService,
		@inject(ILibp2pConfigSymbol) @optional() private readonly config?: ILibp2pConfig,
		@inject(IDatastoreSymbol) @optional() private readonly datastore?: any,
		@multiInject(ILibp2pProtocolHandlerSymbol) @optional() private readonly handlers: ILibp2pProtocolHandler[] = [],
	) { }

	async start(): Promise<void> {
		this.log.info('Libp2pService is starting...');
		const datastore = this.datastore ?? new MemoryDatastore();
		const privateKey = await loadOrCreateSelfKey(datastore);
		this.node = await createLibp2p({
			...(this.config ?? {}),
			datastore,
			privateKey,
			start: true
		});
		await this.node.start();
		let timeout: NodeJS.Timeout;
		const updatePeers = () => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				this.peers.value = this.node?.getPeers() ?? [];
			}, 100);
		};
		this.node.addEventListener('peer:connect', updatePeers);
		this.node.addEventListener('peer:disconnect', updatePeers);
		this.log.info('Libp2pService started!');
		this.log.debug('PeerId: ' + this.node.peerId.toString());

		// Register protocol handlers
		for (const handler of this.handlers) {
			this.node.handle(handler.protocol, (data) => {
				handler.handle(data);
			});
		}
	}

	public async dial(id: PeerId, options?: DialOptions): Promise<Connection> {
		let info = await this.libp2p.peerRouting.findPeer(id);
		if (!await this.libp2p.isDialable(this.peerInfoToMultiAddr(info))) {
			info = await this.libp2p.peerRouting.findPeer(id, {
				useCache: false,
			});
		}

		return this.libp2p.dial(this.peerInfoToMultiAddr(info), options);
	}

	public get libp2p() {
		return this.node!;
	}

	private peerInfoToMultiAddr(info: PeerInfo): Multiaddr[] {
		return info.multiaddrs.map(a => a.encapsulate([{ code: 421, name: 'p2p', value: info.id.toString() }]));
	}

	@preDestroy()
	private destroy() {
		clearInterval(this.timer);
	}

	public peers = new Signal<any[]>([]);

	private node?: Libp2p;
	private timer?: any;
}
