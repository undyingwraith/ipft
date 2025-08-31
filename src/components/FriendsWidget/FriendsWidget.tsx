import { Button, useService, useTranslation } from '@undyingwraith/jaaf-ui';
import { IFriendsService, IFriendsServiceSymbol } from '../../Services';
import styles from './FriendsWidget.module.css';
import { AddFriendWidget } from '../AddFriendWidget';

export function FriendsWidget() {
	const friendsService = useService<IFriendsService>(IFriendsServiceSymbol);
	const _t = useTranslation();

	return (
		<div class={styles.widget}>
			<div>
				<AddFriendWidget />
			</div>
			<div class={styles.friendsList}>
				{friendsService.friends.value.map(f => (
					<div key={f.id}>
						{f.id} - {f.name}
						<Button
							onClick={() => friendsService.removeFriend(f)}
						>{_t('RemoveFriend')}</Button>
					</div>
				))}
			</div>
		</div>
	);
}
