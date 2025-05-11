<script lang="ts" context="module">
	import {
		type TemplateProperty,
		type OptionsMode,
		type FailureActionType,
		type OptionItem,
		ToOptions,
	} from 'Providers/ProvidersSetup/shared/Types';

	type DispatchEvents = {
		change: Partial<Pick<TemplateProperty, 'optionsMode' | 'options'>>;
	};
</script>

<script lang="ts">
	import { createEventDispatcher, onMount, getContext, afterUpdate } from 'svelte';
	import { Setting, DropdownComponent, TextAreaComponent } from 'obsidian';
	import type AutoClassifierPlugin from 'main';
	import { AutoClassifierPluginKey } from 'settings/Swelte/context-keys';

	export let optionsMode: OptionsMode;
	export let options: OptionItem[] | undefined = [];
	export let failureActionType: FailureActionType; // To conditionally hide based on failureAction

	const dispatch = createEventDispatcher<DispatchEvents>();
	const plugin = getContext<AutoClassifierPlugin>(AutoClassifierPluginKey);

	let optionsModeContainerEl: HTMLElement;
	let availableOptionsContainerEl: HTMLElement;
	let optionsTextareaComponent: TextAreaComponent | null = null;

	let internalOptionsString: string = (options || []).join('\n');

	// Sync internalOptionsString when options prop changes from parent
	$: if (options && (options || []).join('\n') !== internalOptionsString) {
		internalOptionsString = (options || []).join('\n');
		if (optionsTextareaComponent) {
			optionsTextareaComponent.setValue(internalOptionsString);
		}
	}

	$: isTextAreaDisabled = optionsMode === 'all';
	$: showAvailableOptionsSection = failureActionType !== 'default-value';

	function handleOptionsModeChange(newMode: OptionsMode) {
		optionsMode = newMode;
		dispatch('change', { optionsMode: newMode });
		// Force re-render or update of dependent UI if necessary
		renderAvailableOptions();
	}

	function handleOptionsTextAreaChange(newOptionsValue: string) {
		internalOptionsString = newOptionsValue;
		const newOptionsArray = newOptionsValue
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');

		dispatch('change', { options: ToOptions(newOptionsArray) });
		// Update count in description
		if (availableOptionsContainerEl) {
			const settingDescEl = availableOptionsContainerEl.querySelector('.setting-item-description');
			if (settingDescEl) {
				settingDescEl.textContent = getDescriptionText(newOptionsArray.length);
			}
		}
	}

	function getDescriptionText(count: number): string {
		let desc = `Enter one option per line. Count: ${count}. `;
		if (optionsMode === 'whitelist') {
			desc += 'Only these options will be sent to LLM.';
		} else if (optionsMode === 'blacklist') {
			desc += 'These options will be excluded from LLM context.';
		} else {
			desc += 'All options are available by default.';
		}
		return desc;
	}

	function renderAvailableOptions() {
		if (!availableOptionsContainerEl) return;
		availableOptionsContainerEl.empty(); // Clear previous content

		if (showAvailableOptionsSection) {
			const optionsSetting = new Setting(availableOptionsContainerEl)
				.setName('Available Options')
				.setDesc(getDescriptionText((options || []).length));

			if (optionsMode === 'whitelist' || optionsMode === 'blacklist') {
				optionsSetting.nameEl.append(' (Suggest: TODO)');
			}

			optionsTextareaComponent = new TextAreaComponent(optionsSetting.controlEl)
				.setValue(internalOptionsString)
				.setPlaceholder('option1\noption2\n...')
				.setDisabled(isTextAreaDisabled)
				.onChange(handleOptionsTextAreaChange);

			optionsTextareaComponent.inputEl.style.width = '100%';
			optionsTextareaComponent.inputEl.style.minHeight = '100px';
		}
	}

	onMount(() => {
		if (optionsModeContainerEl) {
			const modeSetting = new Setting(optionsModeContainerEl)
				.setName('Available Options Mode')
				.setDesc('Define how available options are used.');

			new DropdownComponent(modeSetting.controlEl)
				.addOption('all' as OptionsMode, 'All from options')
				.addOption('whitelist' as OptionsMode, 'Whitelist from options')
				.addOption('blacklist' as OptionsMode, 'Blacklist from options')
				.setValue(optionsMode)
				.onChange((value: OptionsMode) => {
					handleOptionsModeChange(value);
				});
		}
		renderAvailableOptions(); // Initial render for options textarea
	});

	// React to changes in props that affect visibility or content of availableOptions
	$: if (failureActionType && availableOptionsContainerEl) {
		renderAvailableOptions();
	}

	// React to changes in optionsMode for the textarea section
	$: if (optionsMode && availableOptionsContainerEl && showAvailableOptionsSection) {
		renderAvailableOptions();
	}
</script>

<div bind:this={optionsModeContainerEl} class="options-mode-container"></div>
<div bind:this={availableOptionsContainerEl} class="available-options-container">
	<!-- Available Options TextArea will be rendered here by renderAvailableOptions() -->
</div>

<style>
	.options-mode-container,
	.available-options-container {
		margin-bottom: 16px;
	}
	.available-options-container :global(.setting-item-description) {
		white-space: pre-wrap; /* Ensures description wraps and respects newlines if any */
	}
</style>
