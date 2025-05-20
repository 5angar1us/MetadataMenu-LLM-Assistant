<script lang="ts" context="module">
	import {
		type TemplateProperty,
		type OptionsMode,
		// type FailureActionType, // Not directly used in script module
		// type OptionItem, // Not directly used in script module
		// ToOptions // Not directly used in script module
	} from "settings";

	type DispatchEvents = {
		change: Partial<Pick<TemplateProperty, 'optionsMode' | 'options'>>;
	};
</script>

<script lang="ts">
	import { createEventDispatcher, onMount, getContext, onDestroy } from 'svelte';
	import { Setting, DropdownComponent, TextAreaComponent, App, TextComponent, ButtonComponent } from 'obsidian';
	
	import type { OptionsMode as OptionsModeType, FailureActionDefaultValue } from "settings";
	import { ToOptions as ToOptionsFunc } from "settings";
	import { PropertyValueMultiSuggest } from 'settings/Suggest/PropertyValueMultiSuggest';
	import { globasourceFileFieldInfo, AutoClassifierPluginKey } from 'settings/Swelte/context-keys';
	import type AutoClassifierPlugin from 'main';
	import type { ValidatedFieldInfo } from 'types/metadataMenuSchemas';
	import { getAllTags } from "settings/Suggest/getAllTags";


	export let frontmatterSetting: TemplateProperty;

	const dispatch = createEventDispatcher<DispatchEvents>();
    
    const plugin: AutoClassifierPlugin = getContext(AutoClassifierPluginKey);
    const app: App = plugin.app;

    let optionsModeContainerEl: HTMLElement;
    let availableOptionsContainerEl: HTMLElement;
    let optionsTextareaComponent: TextAreaComponent | null = null;
    let optionsDescriptionEl: HTMLParagraphElement | null = null;
    let modeDropdown: DropdownComponent | null = null;
    // let name = frontmatterSetting.key; // This variable was unused
    let textInputComponent: TextComponent | null = null;
    let addOptionsButton: ButtonComponent | null = null;

    let propertyValueSuggest: PropertyValueMultiSuggest | null = null;
    let currentFieldInfos: ValidatedFieldInfo[] = [];
    let unsubscribeGlobasourceFileFieldInfo: (() => void) | null = null;
    

    let internalOptionsString: string = (frontmatterSetting.options || []).join(', ');
    

    $: {
        const newOptionsStringRepresentation = (frontmatterSetting.options || []).map(String).join(', ');
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
    
    $: isTextAreaDisabled = frontmatterSetting.optionsMode === 'all';
    
    function handleOptionsModeChange(newMode: OptionsModeType) {

        frontmatterSetting.optionsMode = newMode;
        dispatch('change', { optionsMode: newMode });
    }
    
    function handleOptionsTextAreaChange(newOptionsValue: string) {
        internalOptionsString = newOptionsValue; 
        const newOptionsArray = newOptionsValue
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s !== '');
        

        frontmatterSetting.options = ToOptionsFunc(newOptionsArray);
        dispatch('change', { options: frontmatterSetting.options });
        
        if (optionsDescriptionEl) {
            optionsDescriptionEl.textContent = getDescriptionText(newOptionsArray.length);
        }
    }
    
    function getDescriptionText(count: number): string {
        let desc = `Enter options separated by commas. Count: ${count}. `;
        if (frontmatterSetting.optionsMode === 'whitelist') {
            desc += 'Only these options will be sent to LLM.';
        } else if (frontmatterSetting.optionsMode === 'blacklist') {
            desc += 'These options will be excluded from LLM context.';
        } else {
            desc += 'All options are available by default (textarea is disabled).';
        }
        return desc;
    }

    function updateSuggesterSettings() {
        if (!propertyValueSuggest) return;

        propertyValueSuggest.setValues(currentFieldInfos); // Pass all available field infos
        propertyValueSuggest.setProperty(frontmatterSetting.key); // Set the current property key

        let valueToExclude: string | undefined = undefined;
        if (frontmatterSetting.failureAction?.type === 'default-value') {
            valueToExclude = (frontmatterSetting.failureAction as FailureActionDefaultValue).value;
        }
        propertyValueSuggest.setExcludedValue(valueToExclude);
    }

    function handleAddOptionsClick() {
        if (!textInputComponent || !frontmatterSetting) return;

        const newValuesString = textInputComponent.getValue();
        if (!newValuesString.trim()) {
            textInputComponent.setValue(''); // Clear if only whitespace
            return; 
        }

        const newValuesArray = newValuesString
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '');

        if (newValuesArray.length === 0) {
            textInputComponent.setValue(''); // Clear if effectively empty after processing
            return;
        }

        const currentOptionsAsStrings: string[] = (frontmatterSetting.options || []).map(String);
        const combinedOptionsAsStrings = Array.from(new Set([...currentOptionsAsStrings, ...newValuesArray]));
        
        frontmatterSetting.options = ToOptionsFunc(combinedOptionsAsStrings);
        dispatch('change', { options: frontmatterSetting.options });
        
        textInputComponent.setValue(''); // Clear the input field
    }

    function handleClearInputClick() {
        if (textInputComponent) {
            textInputComponent.setValue('');
        }
    }
    
    onMount(() => {
        // Setup Dropdown for Options Mode
        if (optionsModeContainerEl) {
            optionsModeContainerEl.empty();
            const modeSetting = new Setting(optionsModeContainerEl)
                .setName('Available Options Mode')
                .setDesc('Define how available options are used.');
            
            modeDropdown = new DropdownComponent(modeSetting.controlEl)
                .addOption('all' as OptionsModeType, 'All from options')
                .addOption('whitelist' as OptionsModeType, 'Whitelist from options')
                .addOption('blacklist' as OptionsModeType, 'Blacklist from options')
                .setValue(frontmatterSetting.optionsMode)
                .onChange(handleOptionsModeChange);
        }
        
        // Setup Textarea for Available Options
        if (availableOptionsContainerEl) {
            availableOptionsContainerEl.empty();
            new Setting(availableOptionsContainerEl)
                .setName('Available Options')
                .setHeading();
            
            const descContainer = availableOptionsContainerEl.createDiv();
            optionsDescriptionEl = descContainer.createEl('p', { cls: 'setting-item-description' });
            optionsDescriptionEl.textContent = getDescriptionText((frontmatterSetting.options || []).length);
            
			const s = new Setting(availableOptionsContainerEl);
            s.setDesc("Search elemnt input")
            textInputComponent = new TextComponent(s.controlEl);
			textInputComponent.setPlaceholder('Add options, comma-separated');
            textInputComponent.setDisabled(isTextAreaDisabled);
            
            addOptionsButton = new ButtonComponent(s.controlEl)
                .setButtonText("Add to Options")
                .setDisabled(isTextAreaDisabled)
                .onClick(handleAddOptionsClick);
            
               
            s.addButton(button => button
                .setButtonText("Clear Input")
                .onClick(handleClearInputClick));

            optionsTextareaComponent = new TextAreaComponent(availableOptionsContainerEl)
                .setValue(internalOptionsString)
                .setPlaceholder('option1, option2, )')
                .setDisabled(isTextAreaDisabled)
                .onChange(handleOptionsTextAreaChange);
            optionsTextareaComponent.inputEl.classList.add('nmDatawiewWhereExpession__input');

            // Initialize PropertyValueMultiSuggest
            propertyValueSuggest = new PropertyValueMultiSuggest(
				textInputComponent.inputEl, // Используем textInputComponent
                app,
                frontmatterSetting.key
            );

            propertyValueSuggest.setTags(getAllTags(plugin.app))

            unsubscribeGlobasourceFileFieldInfo = globasourceFileFieldInfo.subscribe(infos => {
                currentFieldInfos = infos || [];
                updateSuggesterSettings();
            });
            
            // Initial update for the suggester
            updateSuggesterSettings();
        }
    });

    onDestroy(() => {
        if (unsubscribeGlobasourceFileFieldInfo) {
            unsubscribeGlobasourceFileFieldInfo();
        }
        // PropertyValueMultiSuggest cleans itself up when the input element is removed from the DOM,
        // or doesn't require explicit destruction beyond what Obsidian handles for AbstractInputSuggest.
    });
    

    $: if (modeDropdown && frontmatterSetting) {
        modeDropdown.setValue(frontmatterSetting.optionsMode);
    }
    
    $: if (optionsTextareaComponent && frontmatterSetting) {
        optionsTextareaComponent.setDisabled(frontmatterSetting.optionsMode === 'all');
    }
    
    $: if (optionsDescriptionEl && frontmatterSetting) {
        optionsDescriptionEl.textContent = getDescriptionText((frontmatterSetting.options || []).length);
    }

    // Reactive updates for suggester when relevant frontmatterSetting properties change
    $: frontmatterSetting.key, frontmatterSetting.failureAction, updateSuggesterSettings();

    $: if (textInputComponent) {
        textInputComponent.setDisabled(isTextAreaDisabled);
    }

    $: if (addOptionsButton) {
        addOptionsButton.setDisabled(isTextAreaDisabled);
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
