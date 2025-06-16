<script lang="ts" context="module">
	type DispatchEvents = {
		change: Partial<TemplateProperty>;
	};
</script>

<script lang="ts">
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import {
		Setting,
		SliderComponent,
		DropdownComponent,
		TextComponent,
		ButtonComponent,
	} from 'obsidian';
	
	import type {
		TemplateProperty,
		FailureAction,
		FailureActionType,
		FailureActionDefaultValue,
		FailureActionSetOtherProperty,
		FailureActionMoveToFolder
	} from "settingsUI";
	import type AutoClassifierPlugin from 'main';

	import { checkAvailabilityDataview } from 'PluginAvailability';
	import { getAPI, DataviewApi } from 'obsidian-dataview';
	import { PropertyValueSuggest } from 'settingsUI/Suggest/PropertyValueSuggest';
	import { AutoClassifierPluginKey, globasourceFileFieldInfo } from '../context-keys';
	import { PropertyKeySuggest } from 'settingsUI/Suggest/PropertyKeySuggest';

	export let relevance: number | undefined;
	export let failureAction: FailureAction;
	export let globalRelevanceThreshold: number;

	const dispatch = createEventDispatcher<DispatchEvents>();
	const plugin = getContext<AutoClassifierPlugin>(AutoClassifierPluginKey);

	let propertyKeys: string[] = [];
	let propertyKeySuggestInstance: PropertyKeySuggest | null = null;
	let propertyValueSuggestInstance: PropertyValueSuggest | null = null;

	let relevanceSliderEl: HTMLElement;
	let failureActionContainerEl: HTMLElement;
	let failureActionInputsContainerEl: HTMLElement;

	let sliderComponentInstance: SliderComponent | null = null;

	// Initialize currentFailureAction from prop
	let currentFailureAction: FailureAction = { ...failureAction };

	const unsubscribeGlobasourceFileFieldInfo = globasourceFileFieldInfo.subscribe((value) => {
		if (value) {
			propertyKeys = value.map((fieldInfo) => fieldInfo.name);
		} else {
			propertyKeys = [];
		}
		if (propertyKeySuggestInstance) {
			propertyKeySuggestInstance.setValues(propertyKeys);
		}
		if (propertyValueSuggestInstance && currentFailureAction.type === 'set-other-property') {
			// Update PropertyValueSuggest with the new field info
			propertyValueSuggestInstance.setValues(value || []);
		}
	});

	function handleRelevanceChange(value: number) {
		dispatch('change', { relevance: value });
	}

	function updateCurrentFailureAction(newAction: FailureAction) {
		currentFailureAction = { ...newAction };
		dispatch('change', { failureAction: currentFailureAction });
	}

	function handleFailureActionTypeChange(newType: FailureActionType) {
		let newAction: FailureAction;
		switch (newType) {
			case 'set-other-property':
				newAction = {
					type: 'set-other-property',
					targetKey: (currentFailureAction as FailureActionSetOtherProperty)?.targetKey || '',
					targetValue: (currentFailureAction as FailureActionSetOtherProperty)?.targetValue || '',
				};
				break;
			case 'move-to-folder':
				newAction = {
					type: 'move-to-folder',
					folder: (currentFailureAction as FailureActionMoveToFolder)?.folder || '',
				};
				break;
			case 'default-value':
			default:
				newAction = {
					type: 'default-value',
					value: (currentFailureAction as FailureActionDefaultValue)?.value || '',
				};
				break;
		}
		updateCurrentFailureAction(newAction);
		renderFailureActionInputs();
	}

	function renderFailureActionInputs() {
		if (!failureActionInputsContainerEl) return;
		failureActionInputsContainerEl.empty(); // Clear previous inputs
		propertyKeySuggestInstance = null; // Reset instance when inputs are cleared
		propertyValueSuggestInstance = null; // Reset instance for value suggest

		const action = currentFailureAction;

		if (action.type === 'default-value') {
			new Setting(failureActionInputsContainerEl)
				.setName('Default Value')
				.setDesc('Value to set if threshold is not met. (Placeholder for suggest from options)')
				.addText((text) =>
					text
						.setPlaceholder('Enter default value')
						.setValue(action.value)
						.onChange((value) => {
							updateCurrentFailureAction({ ...action, value });
						})
				);
		} else if (action.type === 'set-other-property') {
			new Setting(failureActionInputsContainerEl)
				.setName('Target Property Key')
				.setDesc('Key of the property to set.')
				.addText((text) => {
					text
						.setPlaceholder('Enter property key')
						.setValue(action.targetKey)
						.onChange((value) => {
							const newActionState = { ...action, targetKey: value };
							updateCurrentFailureAction(newActionState);
							if (propertyValueSuggestInstance) {
								propertyValueSuggestInstance.setProperty(value);
							}
						});

					propertyKeySuggestInstance = new PropertyKeySuggest(text.inputEl, plugin.app);
					propertyKeySuggestInstance.setValues(propertyKeys);
				});
			new Setting(failureActionInputsContainerEl)
				.setName('Target Property Value')
				.setDesc('Value for the target property. (Placeholder for property value suggest)')
				.addText((text) => {
					text.setPlaceholder('Enter property value')
						.setValue(action.targetValue)
						.onChange((value) => {
							updateCurrentFailureAction({ ...action, targetValue: value });
						});

					if (checkAvailabilityDataview(plugin.app)) {

						propertyValueSuggestInstance = new PropertyValueSuggest(
							text.inputEl,
							plugin.app,
							action.targetKey
						);
						if ($globasourceFileFieldInfo) {
							propertyValueSuggestInstance.setValues($globasourceFileFieldInfo);
						}
					} else {
					}
				});
		}
	}

	onMount(() => {
		// Ensure failureAction is initialized before creating UI
		if (!failureAction) {
			// This should ideally be handled by the parent ensuring failureAction is always provided
			failureAction = { type: 'default-value', value: '' };
		}
		currentFailureAction = { ...failureAction };

		if (relevanceSliderEl) {
			const sliderSetting = new Setting(relevanceSliderEl)
				.setName('Relevance Threshold')
				.setDesc(
					'Adjust the relevance for this specific frontmatter. Overrides the global setting. Use the reset button to revert to the global threshold.'
				)

			sliderComponentInstance = new SliderComponent(sliderSetting.controlEl)
				.setLimits(0, 1, 0.01) // min, max, step
				.setValue(relevance ?? globalRelevanceThreshold)
				.setDynamicTooltip()
				.onChange(handleRelevanceChange);

			const resetSliderButton = new ButtonComponent(sliderSetting.controlEl)
				.setButtonText('Reset')
				.setIcon('rotate-ccw')
				.setTooltip(`Reset to global threshold`)
				.onClick(() => {
					dispatch('change', { relevance: undefined });
				});
		}

		if (failureActionContainerEl) {
			const failureActionSetting = new Setting(failureActionContainerEl)
				.setName('Action on threshold failure')
				.setDesc('Define the action if the document does not meet the set relevance threshold.');

			new DropdownComponent(failureActionSetting.controlEl)
				.addOption('default-value' as FailureActionType, 'Default value')
				.addOption('set-other-property' as FailureActionType, 'Set value of another property')
				.addOption('move-to-folder' as FailureActionType, 'Move to folder')
				.setValue(currentFailureAction.type)
				.onChange((value: FailureActionType) => {
					handleFailureActionTypeChange(value);
				});

			failureActionInputsContainerEl = failureActionContainerEl.createDiv('failure-action-inputs');
			renderFailureActionInputs();
		}

		return () => {
			unsubscribeGlobasourceFileFieldInfo();
		};
	});

	
	$: {
    if (failureAction && failureAction.type !== currentFailureAction.type) {
        currentFailureAction = { ...failureAction };

        if (failureActionInputsContainerEl) {
            renderFailureActionInputs();
        }
    }
}

	$: {
		if (sliderComponentInstance) {
			sliderComponentInstance.setValue(relevance ?? globalRelevanceThreshold);
		}
	}
</script>

<div bind:this={relevanceSliderEl} class="relevance-slider-container"></div>
<div bind:this={failureActionContainerEl} class="failure-action-container">
	<!-- place for dynamic inputs -->
</div>

<style>
	.relevance-slider-container {
		margin-bottom: 16px;
	}

	.failure-action-container {
		margin-bottom: 16px;
	}
</style>
