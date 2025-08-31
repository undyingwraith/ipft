import { useComputed } from '@preact/signals';
import { useService } from '@undyingwraith/jaaf-ui';
import { Libp2pService, ILibp2pServiceSymbol } from '../Services';

export function ConnectionStatus() {
	const { peers } = useService<Libp2pService>(ILibp2pServiceSymbol);

	return <div>
		{peers.value.map(p => JSON.stringify(p))}
		{useComputed(() => JSON.stringify(peers.value))}
	</div>;
}
