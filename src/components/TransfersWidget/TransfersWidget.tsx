import { useComputed } from '@preact/signals';
import { Button, ButtonGroup, useService, useTranslation } from '@undyingwraith/jaaf-ui';
import { FileTransferService, FileTransferServiceSymbol } from '../../Services';
import styles from './TransfersWidget.module.css';

export function TransfersWidget() {
	const _t = useTranslation();
	const transferService = useService<FileTransferService>(FileTransferServiceSymbol);

	return (
		<div class={styles.container}>
			Active transfers
			<div class={styles.list}>
				{useComputed(() => transferService.transfers.value.map(t => (
					<div key={t.id} class={styles.item}>
						<b>{t.id}</b>
						{t.direction === 'outgoing' ? 'Outbound' : 'Inbound'}
						<b>{t.status}</b>
						{t.error && <div><b>{t.error.name}</b>: {t.error.message}</div>}
						<ButtonGroup>
							{t.status !== 'completed' && t.status !== 'failed' && <Button>Abort</Button>}
							{t.status === 'failed' && <Button>Retry</Button>}
							{(t.status === 'completed' || t.status === 'failed') && (
								<Button
									onClick={() => transferService.clearTransfer(t.id)}
								>
									{_t('Remove')}
								</Button>
							)}
						</ButtonGroup>
					</div>
				)))}
			</div>
		</div>
	);
}
