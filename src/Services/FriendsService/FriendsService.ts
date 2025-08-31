import { Signal } from '@preact/signals';
import { type IKeyValueStorageService, IKeyValueStorageServiceSymbol, type ILogService, ILogServiceSymbol } from '@undyingwraith/jaaf-core';
import { inject, injectable } from 'inversify';
import { ValidationError } from '../../ValidationError';
import { IFriend } from './IFriend';
import { IFriendsService } from './IFriendsService';

@injectable()
export class FriendsService implements IFriendsService {
	public constructor(
		@inject(IKeyValueStorageServiceSymbol) private readonly store: IKeyValueStorageService,
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

	public addFriend(friend: IFriend): void {
		if (this.friends.peek().some(f => f.id === friend.id)) {
			throw new ValidationError('Friend with that id already exists');
		}
		this.friends.value = [...this.friends.peek(), friend];
	}

	public removeFriend(friend: IFriend): void {
		this.friends.value = this.friends.peek().filter(f => f.id !== friend.id);
	}

	public friends = new Signal<IFriend[]>([]);
}
