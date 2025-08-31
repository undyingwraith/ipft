import { useComputed } from '@preact/signals';
import { useService } from '@undyingwraith/jaaf-ui';
import { FileTransferService, FileTransferServiceSymbol } from '../Services';

export function ActiveTransfers() {
	const transferService = useService<FileTransferService>(FileTransferServiceSymbol);

	return (
		<div>
			Active transfers
			{useComputed(() => transferService.transfers.value.map(t => (
				<div key={t.id}>
					<b>{t.id}</b>
					{t.direction === 'outgoing' ? 'Outbound' : 'Inbound'}
					{t.status}
				</div>
			)))}
		</div>
	);
}
