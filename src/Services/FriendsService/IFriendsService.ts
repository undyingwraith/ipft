import { Signal } from '@preact/signals';
import { IFriend } from './IFriend';

export const IFriendsServiceSymbol = Symbol.for('IFriendsService');

export interface IFriendsService {
	/**
	 * 
	 * @param friend 
	 */
	addFriend(friend: IFriend): void;

	/**
	 * 
	 * @param friend 
	 */
	removeFriend(friend: IFriend): void;

	/**
	 * List of all current friends.
	 */
	friends: Signal<IFriend[]>;
}
