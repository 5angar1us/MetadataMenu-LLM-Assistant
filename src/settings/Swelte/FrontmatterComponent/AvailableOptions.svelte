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
	import { createEventDispatcher, onMount } from 'svelte';
	import { Setting, DropdownComponent, TextAreaComponent } from 'obsidian';
	import type { OptionsMode as OptionsModeType, OptionItem as OptionItemType, FailureActionType as FailureActionTypeType } from 'Providers/ProvidersSetup/shared/Types';
    import { ToOptions as ToOptionsFunc } from 'Providers/ProvidersSetup/shared/Types';


	export let optionsMode: OptionsModeType;
	export let options: OptionItemType[] | undefined = [];
	export let failureActionType: FailureActionTypeType;

	const dispatch = createEventDispatcher<DispatchEvents>();

	let optionsModeContainerEl: HTMLElement;
	let availableOptionsContainerEl: HTMLElement;
	let optionsTextareaComponent: TextAreaComponent | null = null;
	let optionsDescriptionEl: HTMLParagraphElement | null = null;
	let modeDropdown: DropdownComponent | null = null;

	let internalOptionsString: string = (options || []).join(', ');

	$: {
		if (options) { 
			const newOptionsStringRepresentation = (options || []).map(String).join(', ');
			const currentInternalOptionsContent = internalOptionsString
				.split(',')
				.map(s => s.trim())
				.filter(s => s !== '')
				.join(', ');

			if (newOptionsStringRepresentation !== currentInternalOptionsContent) {
				internalOptionsString = newOptionsStringRepresentation;
				if (optionsTextareaComponent && optionsTextareaComponent.getValue() !== internalOptionsString) {
					optionsTextareaComponent.setValue(internalOptionsString);
				}
			}
		}
	}

	$: isTextAreaDisabled = optionsMode === 'all';

	function handleOptionsModeChange(newMode: OptionsModeType) {
		dispatch('change', { optionsMode: newMode });
	}

	function handleOptionsTextAreaChange(newOptionsValue: string) {
		internalOptionsString = newOptionsValue; 
		const newOptionsArray = newOptionsValue
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s !== '');

		dispatch('change', { options: ToOptionsFunc(newOptionsArray) });

		if (optionsDescriptionEl) {
			optionsDescriptionEl.textContent = getDescriptionText(newOptionsArray.length);
		}
	}

	function getDescriptionText(count: number): string {
		let desc = `Enter options separated by commas. Count: ${count}. `;
		if (optionsMode === 'whitelist') {
			desc += 'Only these options will be sent to LLM.';
		} else if (optionsMode === 'blacklist') {
			desc += 'These options will be excluded from LLM context.';
		} else {
			desc += 'All options are available by default (textarea is disabled).';
		}
		return desc;
	}

	onMount(() => {
		// Setup Dropdown for Options Mode
		if (optionsModeContainerEl) {
			optionsModeContainerEl.empty(); // Clear if anything was there before svelte hydration (e.g. SSR)
			const modeSetting = new Setting(optionsModeContainerEl)
				.setName('Available Options Mode')
				.setDesc('Define how available options are used.');

			modeDropdown = new DropdownComponent(modeSetting.controlEl)
				.addOption('all' as OptionsModeType, 'All from options')
				.addOption('whitelist' as OptionsModeType, 'Whitelist from options')
				.addOption('blacklist' as OptionsModeType, 'Blacklist from options')
				.setValue(optionsMode)
				.onChange(handleOptionsModeChange);
		}

		// Setup Textarea for Available Options
		if (availableOptionsContainerEl) {
			availableOptionsContainerEl.empty(); // Clear if anything was there before svelte hydration
			new Setting(availableOptionsContainerEl)
				.setName('Available Options')
				.setHeading();
			
			const descContainer = availableOptionsContainerEl.createDiv();
			optionsDescriptionEl = descContainer.createEl('p', { cls: 'setting-item-description' });
			optionsDescriptionEl.textContent = getDescriptionText((options || []).length);

			optionsTextareaComponent = new TextAreaComponent(availableOptionsContainerEl)
				.setValue(internalOptionsString) 
				.setPlaceholder('option1, option2, ...')
				.setDisabled(isTextAreaDisabled)
				.onChange(handleOptionsTextAreaChange);
			optionsTextareaComponent.inputEl.classList.add('nmDatawiewWhereExpession__input');
		}
	});

	$: if (modeDropdown) {
		modeDropdown.setValue(optionsMode);
	}

	$: if (optionsTextareaComponent) {
		optionsTextareaComponent.setDisabled(isTextAreaDisabled);
	}

	$: if (optionsDescriptionEl) {
		optionsDescriptionEl.textContent = getDescriptionText((options || []).length);
	}

</script>

<div bind:this={optionsModeContainerEl} class="options-mode-container">
	<!-- "Available Options Mode" Dropdown will be rendered by onMount -->
</div>
<div bind:this={availableOptionsContainerEl} class="available-options-container">
	<!-- "Available Options" Title, Description, TextArea will be rendered by onMount -->
</div>

<style>
	.options-mode-container,
	.available-options-container {
		margin-bottom: 16px;
	}

	.available-options-container :global(textarea.nmDatawiewWhereExpession__input) {
		width: 100%;
		min-height: 80px; 
		max-height: 300px;
		overflow-y: auto;
	}

	.available-options-container :global(p.setting-item-description) {
		font-size: var(--font-ui-smaller);
		color: var(--text-muted);
		margin-bottom: 8px;
	}
</style>
