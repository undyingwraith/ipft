import { ReadonlySignal, useSignal } from '@preact/signals';
import { Button, ButtonGroup, Loader, useTranslation } from '@undyingwraith/jaaf-ui';
import { ComponentChildren } from 'preact';

export interface IStep {
	//title: string;
	valid: ReadonlySignal<boolean>;
	content: ComponentChildren;
}

export function Wizard(props: { steps: IStep[]; done: () => void | Promise<void>; }) {
	const _t = useTranslation();

	const step = useSignal(0);
	const loading = useSignal(false);

	return loading.value ? (
		<Loader />
	) : (
		<div>
			{props.steps[step.value].content}
			<ButtonGroup>
				<Button disabled={step.value == 0} onClick={() => step.value = step.value - 1}>{_t('Previous')}</Button>
				<Button disabled={!props.steps[step.value].valid.value || step.value === props.steps.length} onClick={() => {
					if (step.value === props.steps.length - 1) {
						loading.value = true;
						Promise.resolve(props.done())
							.then(() => {
								step.value = 0;
								loading.value = false;
							});
					} else {
						step.value = step.value + 1;
					}
				}}>{_t('Next')}</Button>
			</ButtonGroup>
		</div>
	);
}
