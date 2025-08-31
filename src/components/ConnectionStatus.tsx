import { useComputed } from '@preact/signals';
import { Button, useService } from '@undyingwraith/jaaf-ui';
import { Libp2pService, ILibp2pServiceSymbol } from '../Services';

export function ConnectionStatus() {
	const { peers } = useService<Libp2pService>(ILibp2pServiceSymbol);

	return <div>
		<Button>
			Connected peers: {useComputed(() => peers.value.length)}
		</Button>
		<div style={{ display: 'none' }}>
			{useComputed(() => peers.value.map(p => (
				<div key={p.toString()}>
					{p.toString()}
				</div>
			)))}
		</div>
	</div>;
}
