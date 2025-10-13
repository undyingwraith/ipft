import { Connection, Stream } from '@libp2p/interface';
import { peerIdFromString } from '@libp2p/peer-id';
import { decode, encode } from "@msgpack/msgpack";
import { Signal } from '@preact/signals';
import { type ILogService, ILogServiceSymbol, uuid } from '@undyingwraith/jaaf-core';
import { inject, injectable } from 'inversify';
import { ILibp2pServiceSymbol, Libp2pService } from '../Libp2pService';
import { IFileInfo } from './IFileInfo';
import { IFile } from './IFile';

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

	async startTransfer(fileList: FileList, recipients: string[]) {
		const transfer: ITransfer = {
			id: uuid(),
			direction: 'outgoing',
			status: 'connecting',
			files: fileList,
		};
		this.transfers.value = [...this.transfers.value, transfer];

		try {
			console.log('starting transfer to', recipients);
			for (const recipient of recipients) {
				const peerId = peerIdFromString(recipient);

				const conn = await this.transport.dial(peerId);
				const stream = await conn.newStream(this.protocol);

				// Update status
				this.updateStatus(transfer.id, 'waiting');

				const files: IFileInfo[] = [];
				for (let i = 0; i < fileList.length; i++) {
					const f = fileList.item(i)!;
					files.push({
						mime: f.type,
						name: f.name,
						size: f.size,
					});
				}
				const request: IRequest = {
					id: transfer.id,
					type: 'request',
					files,
				};
				// Send transfer request
				stream.send(encode(request));
				this.updateStatus(transfer.id, 'waiting');

				// Handle responses
				this.handleStream(stream, conn);
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
		stream.addEventListener('message', async (evt) => {
			const data = decode(evt.data.subarray());
			if (isIRequest(data)) {
				if (data.type === 'request') {
					console.log('request received', data);
					this.transfers.value = [...this.transfers.value, {
						id: data.id,
						direction: 'incoming',
						status: 'waiting',
					}];
					const accepted = window.confirm(`${connection.remotePeer.toString()} wants to send you ${data.files.map(f => `'${f.name}' ${f.size}`)}!`);
					stream.send(encode({
						id: data.id,
						response: accepted ? 'accepted' : 'declined',
					} as IResponse));
				} else {
					console.log('transfer received', data);
					for (const f of data.files) {
						//@ts-ignore
						const blob = new Blob([f.content], { type: f.mime });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.download = f.name;
						a.href = url;
						a.click();

						//TODO: revoke objecturl
					}
				}
			} else if (isIResponse(data)) {
				console.log('response received', data);
				if (data.response === 'accepted') {
					this.updateStatus(data.id, 'transfering');
					const transfer = this.transfers.value.find(t => t.id === data.id);
					if (transfer && transfer.files) {
						const files: IFile[] = [];
						for (let i = 0; i < transfer.files.length; i++) {
							const f = transfer.files.item(i)!;
							files.push({
								mime: f.type,
								name: f.name,
								size: f.size,
								content: await readFile(f),
							});
						}
						const fileTransfer: IRequest = {
							id: data.id,
							type: 'transfer',
							files,
						};
						stream.send(encode(fileTransfer));
					}
					//TODO: error handling
				} else {
					this.updateStatus(data.id, 'declined');
				}
				//TODO: send file
			}
		});

		stream.addEventListener('remoteCloseWrite', () => {
			stream.close();
		});
	}

	private updateStatus(id: string, status: TStatus, error?: Error) {
		this.transfers.value = this.transfers.value.map(t => t.id === id ? { ...t, status, error } : t);
	}

	public readonly transfers = new Signal<ITransfer[]>([]);

	private readonly protocol = '/ipft/transfer/1.0.0';
}

export function readFile(file: File): Promise<Uint8Array> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(new Uint8Array(reader.result as ArrayBuffer));
		};
		reader.onerror = () => reject();
		reader.readAsArrayBuffer(file);
	});
}

type TStatus = 'connecting' | 'waiting' | 'transfering' | 'completed' | 'failed' | 'declined';
type TResponseStatus = 'accepted' | 'declined' | 'failed' | 'completed';

export interface ITransfer {
	id: string;
	direction: 'incoming' | 'outgoing';
	status: TStatus;
	files?: FileList;
	error?: Error;
}

export interface IResponse {
	id: string;
	response: TResponseStatus;
}

export function isIResponse(item: any): item is IResponse {
	return typeof item.id === 'string' && typeof item.response === 'string';
}

export type IRequest = IRequestRequest | ITransferRequest;

export interface IRequestRequest {
	id: string;
	type: 'request';
	files: IFileInfo[];
}

export interface ITransferRequest {
	id: string;
	type: 'transfer',
	files: IFile[],
}

export function isIRequest(item: any): item is IRequest {
	return typeof item.id === 'string' && typeof item.files?.length === 'number' && typeof item.type === 'string';
}
