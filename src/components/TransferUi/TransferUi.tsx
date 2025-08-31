import { useService } from '@undyingwraith/jaaf-ui';
import { ConnectionStatus } from '../ConnectionStatus';
import { FileShareWidget } from '../FileShareWidget';
import { FriendsWidget } from '../FriendsWidget';
import { ThemeButton } from '../ThemeButton';
import styles from './TransferUi.module.css';
import { Libp2pService, ILibp2pServiceSymbol } from '../../Services';
import { ActiveTransfers } from '../ActiveTransfers';

export function TransferUi() {
	const libp2pService = useService<Libp2pService>(ILibp2pServiceSymbol);

	return (
		<div class={styles.container}>
			<div>
				<div>{libp2pService.libp2p.peerId.toString()}</div>
				toolbar
				<ConnectionStatus />
				<ThemeButton />
			</div>
			<div class={styles.main}>
				<ActiveTransfers />
				<FriendsWidget />
				<FileShareWidget />
			</div>
		</div>
	);
}
