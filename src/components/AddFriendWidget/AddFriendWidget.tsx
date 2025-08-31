import { batch, useSignal } from '@preact/signals';
import { Button, TextInput, useService, useTranslation } from '@undyingwraith/jaaf-ui';
import { IFriendsService, IFriendsServiceSymbol } from '../../Services';
import styles from './AddFriendWidget.module.css';

export function AddFriendWidget() {
	const friendsService = useService<IFriendsService>(IFriendsServiceSymbol);
	const _t = useTranslation();

	const error = useSignal<Error | undefined>(undefined);
	const name = useSignal<string>('');
	const id = useSignal<string>('');

	return (
		<div>
			AddFriendWidget
			<TextInput
				label={'name'}
				value={name}
			/>
			<TextInput
				label={'id'}
				value={id}
			/>
			<Button onClick={() => {
				try {
					friendsService.addFriend({
						id: id.value,
						name: name.value,
					});
					batch(() => {
						error.value = undefined;
						name.value = '';
						id.value = '';
					});
				} catch (ex: any) {
					error.value = ex;
				}
			}}>{_t('AddFriend')}</Button>
			{error.value && <p class={styles.errorText}>{error.value.message}</p>}
		</div>
	);
}
