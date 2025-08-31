import '@undyingwraith/jaaf-ui/style.css';
import 'reflect-metadata';

import { BrowserModule } from '@undyingwraith/jaaf-browser';
import { CoreModule } from '@undyingwraith/jaaf-core';
import { JaafApp, UiModule } from '@undyingwraith/jaaf-ui';
import { render } from 'preact';
import { TransferUi } from './components';
import { IpftModule } from './IpftModule';

export function App() {
	return (
		<JaafApp
			setup={async (app) => {
				await app.use(CoreModule);
				await app.use(BrowserModule);
				await app.use(UiModule);
				await app.use(IpftModule);
			}}
		>
			<TransferUi />
		</JaafApp>
	);
}

render(<App />, document.getElementById('app') as HTMLElement);
