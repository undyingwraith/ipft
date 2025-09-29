import { Connection, Stream } from '@libp2p/interface';
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
		this.handleStream = this.handleStream.bind(this);
	}

	public async init(): Promise<void> {
		this.log.debug(`Registering protocol handler '${this.protocol}'...`);
		await this.transport.libp2p.handle(this.protocol, this.handleStream);
		console.log(this.transport.libp2p.getProtocols());
		this.log.debug('Registered protocol handler!');
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

				/*
				const conn = await this.transport.dial(peerId);
				console.log(conn.streams);
				const stream = await conn.newStream(this.protocol);
				*/

				const info = await this.transport.libp2p.peerRouting.findPeer(peerId);
				const stream = await this.transport.libp2p.dialProtocol(info.multiaddrs, this.protocol);

				// Update status
				this.updateStatus(transfer.id, 'waiting');

				if (stream instanceof WritableStream) {
					console.log('writing');
					const writer = stream.getWriter();
					writer.write('test');
				}
				console.log(stream);

				//TODO: actually initiate the transfer once partner has accepted

				this.updateStatus(transfer.id, 'completed');
			}
		} catch (ex: any) {
			this.log.error(ex);
			this.updateStatus(transfer.id, 'failed', ex);
		}
	}

	public clearTransfer(id: string) {
		this.transfers.value = this.transfers.value.filter(i => i.id !== id);
	}

	private handleStream(stream: Stream, connection: Connection) {
		console.log('protocol init', connection);
		stream.addEventListener('message', (evt: any) => {
			console.log(evt);
			stream.send(evt.data);
		});

		stream.addEventListener('remoteCloseWrite', () => {
			stream.close();
		});
	}

	private updateStatus(id: string, status: TStatus, error?: Error) {
		this.transfers.value = this.transfers.value.map(t => t.id === id ? { ...t, status, error } : t);
	}

	public readonly transfers = new Signal<ITransfer[]>([]);

	private readonly protocol = '/ipft/transfer/1';
}

type TStatus = 'connecting' | 'waiting' | 'transfering' | 'completed' | 'failed';

export interface ITransfer {
	id: string;
	direction: 'incoming' | 'outgoing';
	status: TStatus;
	error?: Error;
}
