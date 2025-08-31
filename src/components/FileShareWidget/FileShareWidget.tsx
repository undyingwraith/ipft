import { computed, useSignal } from '@preact/signals';
import { useService } from '@undyingwraith/jaaf-ui';
import { FileTransferService, FileTransferServiceSymbol, IFriendsService, IFriendsServiceSymbol } from '../../Services';
import { Wizard } from '../Wizard';

export function FileShareWidget() {
	const friendsService = useService<IFriendsService>(IFriendsServiceSymbol);
	const shareService = useService<FileTransferService>(FileTransferServiceSymbol);
	const files = useSignal<FileList | null>(null);
	const selectedFriends = useSignal<string[]>([]);

	return (
		<Wizard
			steps={[
				{
					content: (
						<div>
							<input
								type={'file'}
								onChange={(ev) => {
									files.value = ev.currentTarget.files;
								}} />
						</div>
					),
					valid: computed(() => files.value !== null)
				},
				{
					content: (
						<div>{friendsService.friends.value.map(f => selectedFriends.value.includes(f.id) ? (
							<div onClick={() => selectedFriends.value = selectedFriends.value.filter(s => s !== f.id)} style={{ color: 'blue' }}>{f.name}</div>
						) : (
							<div onClick={() => selectedFriends.value = [...selectedFriends.value, f.id]} style={{ color: 'red' }}>{f.name}</div>
						))}</div>
					),
					valid: computed(() => selectedFriends.value.length > 0)
				}
			]}
			done={() => {
				shareService.startTransfer(files.value!, selectedFriends.value);
				//TODO: send files
				files.value = null;
				selectedFriends.value = [];
			}}
		/>
	);
}
