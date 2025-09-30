import { loadOrCreateSelfKey } from '@libp2p/config';
import { Connection, DialOptions, PeerId } from '@libp2p/interface';
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
		const info = await this.libp2p.peerRouting.findPeer(id);
		return this.libp2p.dial(info.multiaddrs, options);
	}

	public get libp2p() {
		return this.node!;
	}

	public peers = new Signal<any[]>([]);

	@preDestroy()
	private destroy() {
		clearInterval(this.timer);
	}

	private node?: Libp2p;
	private timer?: any;
}
