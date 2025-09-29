import { Signal } from '@preact/signals';
import { type IKeyValueStorageService, IKeyValueStorageServiceSymbol, type ILogService, ILogServiceSymbol } from '@undyingwraith/jaaf-core';
import { inject, injectable } from 'inversify';
import { ValidationError } from '../../ValidationError';
import { IFriend } from './IFriend';
import { IFriendsService } from './IFriendsService';
import { ILibp2pServiceSymbol, Libp2pService } from '../Libp2pService';
import { peerIdFromString } from '@libp2p/peer-id';

@injectable()
export class FriendsService implements IFriendsService {
	public constructor(
		@inject(IKeyValueStorageServiceSymbol) private readonly store: IKeyValueStorageService,
		@inject(ILibp2pServiceSymbol) private readonly transport: Libp2pService,
		@inject(ILogServiceSymbol) private readonly log: ILogService,
	) {
		const storageKey = 'friends';
		if (this.store.has(storageKey)) {
			this.friends.value = JSON.parse(this.store.get(storageKey)!);
		}
		this.friends.subscribe((value) => {
			this.store.set(storageKey, JSON.stringify(value));
		});
	}

	public start(): void {
		setInterval(() => {
			for (const friend of this.friends.peek()) {
				this.transport.dial(peerIdFromString(friend.id));
			}
		}, 30 * 1000); //TODO: reduce interval
	}

	public addFriend(friend: IFriend): void {
		if (this.transport.libp2p.peerId.toString() === friend.id) {
			throw new ValidationError('Can\'t add yourself, you actually need friends!');
		}
		if (this.friends.peek().some(f => f.id === friend.id)) {
			throw new ValidationError('Friend with that id already exists!');
		}
		this.friends.value = [...this.friends.peek(), friend];
	}

	public removeFriend(friend: IFriend): void {
		this.friends.value = this.friends.peek().filter(f => f.id !== friend.id);
	}

	public friends = new Signal<IFriend[]>([]);
}
