import { IThemeService, IThemeServiceSymbol, useService } from '@undyingwraith/jaaf-ui';

export function ThemeButton() {
	const theme = useService<IThemeService>(IThemeServiceSymbol);

	return (
		<button onClick={() => {
			theme.darkMode.value = !theme.darkMode.value;
		}}>
			{theme.darkMode.value ? 'burn your eyes' : 'relieve your eyes'}
		</button>
	);
}
