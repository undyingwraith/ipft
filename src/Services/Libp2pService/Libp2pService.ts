import { Signal } from '@preact/signals';
import { type ILogService, ILogServiceSymbol } from '@undyingwraith/jaaf-core';
import { inject, injectable, multiInject, optional, preDestroy } from 'inversify';
import { createLibp2p, Libp2p } from 'libp2p';
import { ILibp2pProtocolHandler, ILibp2pProtocolHandlerSymbol } from '../Libp2pProtocolHandler';
import { type ILibp2pConfig, ILibp2pConfigSymbol } from './ILibp2pConfig';
import { ILibp2pService } from './ILibp2pService';

@injectable()
export class Libp2pService implements ILibp2pService {
	constructor(
		@inject(ILogServiceSymbol) private readonly log: ILogService,
		@inject(ILibp2pConfigSymbol) @optional() private readonly config?: ILibp2pConfig,
		@multiInject(ILibp2pProtocolHandlerSymbol) @optional() private readonly handlers: ILibp2pProtocolHandler[] = [],
	) { }

	async start(): Promise<void> {
		this.log.info('Libp2pService is starting...');
		this.node = await createLibp2p({
			...(this.config ?? {}),
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
