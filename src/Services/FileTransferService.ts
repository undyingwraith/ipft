import { peerIdFromString } from '@libp2p/peer-id';
import { Signal } from '@preact/signals';
import { type ILogService, ILogServiceSymbol, uuid } from '@undyingwraith/jaaf-core';
import { inject, injectable } from 'inversify';
import { ILibp2pServiceSymbol, Libp2pService } from './Libp2pService';

export const FileTransferServiceSymbol = Symbol.for('FileTransferService');

@injectable()
export class FileTransferService {
	constructor(
		@inject(ILibp2pServiceSymbol) private readonly transport: Libp2pService,
		@inject(ILogServiceSymbol) private readonly log: ILogService,
	) {
		this.transport.libp2p.handle(this.protocol, (conn) => {
			console.log(conn);
		});
	}

	async startTransfer(files: FileList, recipients: string[]) {
		const transfer: ITransfer = {
			id: uuid(),
			direction: 'outgoing',
			status: 'connecting',
		};
		this.transfers.value = [...this.transfers.value, transfer];

		try {
			console.log('starting transfer to', recipients);
			for (const recipient of recipients) {
				const peerId = peerIdFromString(recipient);

				const info = await this.transport.libp2p.peerRouting.findPeer(peerId);
				this.log.debug(`Found peer '${peerId.toString()}'`);

				const conn = await this.transport.libp2p.dial(info.multiaddrs);
				this.log.debug(`Connected to peer '${peerId.toString()}'`);

				// Update status
				this.updateStatus(transfer.id, 'waiting');

				console.log('connected to peer');
				const stream = await conn.newStream(this.protocol);
				if (stream instanceof WritableStream) {
					const writer = stream.getWriter();
					writer.write('test');
				}
				console.log(stream);

				//TODO: actually initiate the transfer once partner has accepted

				this.updateStatus(transfer.id, 'completed');
			}
		} catch (ex: any) {
			this.log.error(ex);
			this.updateStatus(transfer.id, 'failed');
		}
	}

	private updateStatus(id: string, status: TStatus) {
		this.transfers.value = this.transfers.value.map(t => t.id === id ? { ...t, status } : t);
	}

	public readonly transfers = new Signal<ITransfer[]>([]);

	private readonly protocol = '/x/file-transfer/1';
}

type TStatus = 'connecting' | 'waiting' | 'transfering' | 'completed' | 'failed';

export interface ITransfer {
	id: string;
	direction: 'incoming' | 'outgoing';
	status: TStatus;
}
