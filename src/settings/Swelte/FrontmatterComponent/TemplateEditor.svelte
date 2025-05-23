<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import FileInput from './FileInput.svelte';
	import { Setting, TextComponent } from 'obsidian';

	import type { FormatTemplate, TemplateProperty } from 'settings';
	import type AutoClassifierPlugin from 'main';
	import { addFrontmatterSetting, getFrontmatter } from 'frontmatter';
	import { GetMetadataMenuApi } from 'PluginAvailability';
	import {
		AutoClassifierPluginKey,
		globasourceFileFieldInfo,
		MetadataPropertyKeys,
	} from '../context-keys';
	import ToggleWrapper from './ToggleWrapper.svelte';
	import {
		ValidatedFieldInfoSchema,
		type ValidatedFieldInfo,
	} from '../../../types/metadataMenuSchemas';
	import type { SettingsChangeEvent, DeleteFrontmatter } from './FrontmatterCard.svelte';
	import { getOptionsString as getOptions, isSupportedFiled } from 'types/metadataMenusGetOptions';
	import { writable } from 'svelte/store';
	import { getRawSupportedFields, getSupportedFieldsWitOptionsFromRaw, type RichField } from 'types/metadataMenuUtils';

	export let plugin: AutoClassifierPlugin;
	export let onUpdate: (format: FormatTemplate) => void;
	export let initialFormatTemplate: FormatTemplate;

	let formatTemplate = initialFormatTemplate;

	let outputText = '';
	let outputText2 = '';
	let templateNameContainer: HTMLElement;

	// Map to store references to FrontmatterCard components
	let frontmatterCardRefs = new Map<number, { setExpanded: (value: boolean) => void }>();

	let sourceFileFieldInfo: Array<ValidatedFieldInfo> = [];

	setContext(AutoClassifierPluginKey, plugin);

	onMount(() => {
		if (templateNameContainer) {
			new Setting(templateNameContainer)
				.setName('Template Name')
				.setDesc('Enter a name for this template configuration.')
				.addText((text: TextComponent) => {
					text
						.setPlaceholder('E.g., Meeting Notes Template')
						.setValue(formatTemplate.name)
						.onChange(async (value) => {
							formatTemplate.name = value;
							onUpdate(formatTemplate);
						});
				});
		}
		if (formatTemplate.sourceNotePath) {
			updateSourceData(formatTemplate.sourceNotePath);
		} else {
			showInOutputTextIfDebug('No source file initially selected.');
		}
	});

	async function updateSourceData(filePath: string) {
		let currentOutputText = '';
		try {
			const rawFildInfo = await getRawSupportedFields(filePath);
			
			sourceFileFieldInfo = rawFildInfo
			globasourceFileFieldInfo.set(sourceFileFieldInfo);
			
			currentOutputText = JSON.stringify(rawFildInfo, null, 2);
			
			handlecontrolFieldValueChange(filePath);
			updateRichFields();
		} catch (error) {
			currentOutputText = 'Error fetching or parsing file fields. See console for details.';
			if (plugin.settings.isDebug) console.error(`Error processing file '${filePath}':`, error);
		}
		showInOutputTextIfDebug(currentOutputText);
	}

	function showInOutputTextIfDebug(currentOutputText: string) {
		if (plugin.settings.isDebug) {
			outputText = currentOutputText;
		} else {
			outputText = '';
		}
	}

	// Reactive selectedFile derived from formatTemplate
	$: selectedFile = formatTemplate.sourceNotePath || '';

	function handlecontrolFieldValueChange(filePath: string){
		const targetFrontmatterKey = plugin.settings.metadataMenufileClassAlias;
		const tFile = plugin.app.vault.getFileByPath(filePath)!;
		const fieldValue = getFrontmatter(tFile, targetFrontmatterKey) as string;
		formatTemplate.controlFieldValue = fieldValue;
		onUpdate(formatTemplate);
	}

	async function updateRichFields() {
		const richFilds = await getSupportedFieldsWitOptionsFromRaw(sourceFileFieldInfo);

		const text = JSON.stringify(richFilds, null, 2);
		showInOutputText2IfDebug(text);

		handleRichFildsChange(richFilds);
	}

	function showInOutputText2IfDebug(currentOutputText: string) {
		if (plugin.settings.isDebug) {
			outputText2 = currentOutputText;
		} else {
			outputText2 = '';
		}
	}

	// Reactive statement to handle toggling of showDebugOutput
	$: if (plugin?.settings) {
		updateSourceData(selectedFile);
	}

	function handleRichFildsChange(fileds: RichField[]){
		formatTemplate.RichField = fileds;
		onUpdate(formatTemplate);
	}

	function handleFileChange(filePath: string) {
		formatTemplate.sourceNotePath = filePath;
		onUpdate(formatTemplate);
	}

	async function handleSettingsChange(event: SettingsChangeEvent) {
		const { frontmatterId, updatedFrontmatter } = event.detail;

		const index = formatTemplate.frontmatters.findIndex((f) => f.id === frontmatterId);
		if (index === -1) return;
		// Ensure reactivity by creating a new array
		const newFrontmatters = [...formatTemplate.frontmatters];
		newFrontmatters[index] = updatedFrontmatter;
		formatTemplate.frontmatters = newFrontmatters;
		onUpdate(formatTemplate);
	}

	async function handleDelete(event: DeleteFrontmatter) {
		const { frontmatterId } = event.detail;

		if (typeof frontmatterId !== 'number') {
			console.error('Failed to get frontmatterId from delete event', event.detail);
			return;
		}

		formatTemplate.frontmatters = formatTemplate.frontmatters.filter((f) => f.id !== frontmatterId);
		onUpdate(formatTemplate);
	}

	async function addNewFrontmatter() {
		const newSetting = addFrontmatterSetting();
		formatTemplate.frontmatters = [...formatTemplate.frontmatters, newSetting];
		onUpdate(formatTemplate);
	}

	// Functions to control all FrontmatterCard components
	function expandAllDetails() {
		frontmatterCardRefs.forEach((card) => card.setExpanded(true));
	}

	function collapseAllDetails() {
		frontmatterCardRefs.forEach((card) => card.setExpanded(false));
	}
</script>

<div class="frontmatter-manager">
	<div bind:this={templateNameContainer} />
	<FileInput
		value={selectedFile}
		placeholder="Search for a file..."
		label="File Class"
		description="This file serves as a source of settings. It is not a service file of the Metadata Menu plugin, but a created 
		note file with the specified FileClass field. This is done specifically due to the limitations of the Metadata Menu plugin API."
		app={plugin.app}
		onChange={handleFileChange}
	/>

	{#if plugin.settings.isDebug}
		{#if outputText}
			<div class="output-textarea">
				<label>
					Output Information
					<textarea
						readonly
						bind:value={outputText}
						placeholder="Output will appear here..."
						class="output-field"
					/>
				</label>
			</div>
		{/if}
		{#if outputText2}
			<div class="output-textarea">
				<label>
					Parse options Information
					<textarea
						readonly
						bind:value={outputText2}
						placeholder="Output will appear here..."
						class="output-field"
					/>
				</label>
			</div>
		{/if}
	{/if}

	{#if formatTemplate.frontmatters.length > 0}
		<div class="global-frontmatter-controls">
			<button on:click={expandAllDetails} class="clickable-icon">Expand All</button>
			<button on:click={collapseAllDetails} class="clickable-icon">Collapse All</button>
		</div>
	{/if}

	<div class="frontmatter-list">
		{#each formatTemplate.frontmatters as frontmatter (frontmatter.id)}
			<ToggleWrapper
				item={frontmatter}
				{frontmatterCardRefs}
				on:settingsChange={handleSettingsChange}
				on:delete={handleDelete}
			/>
		{/each}
	</div>

	<button class="add-frontmatter-button" on:click={addNewFrontmatter}>
		+ Add New Frontmatter
	</button>
</div>

<style>
	.frontmatter-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 16px;
	}

	.add-frontmatter-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 8px;
		background-color: var(--interactive-accent);
		color: var(--text-on-accent);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
	}

	.add-frontmatter-button:hover {
		background-color: var(--interactive-accent-hover);
	}

	.global-frontmatter-controls {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
		margin-top: 8px;
	}

	.global-frontmatter-controls button {
		padding: 6px 12px;
		background-color: var(--interactive-normal);
		color: var(--text-on-button);
		border: 1px solid var(--background-modifier-border);
		border-radius: var(--radius-m);
		cursor: pointer;
		font-size: var(--font-ui-small);
	}

	.global-frontmatter-controls button:hover {
		background-color: var(--interactive-hover);
	}

	.output-textarea {
		margin-top: 16px;
		margin-bottom: 16px;
	}
	.output-textarea label {
		display: block;
		margin-bottom: 4px;
		font-weight: 500;
	}
	.output-field {
		width: 100%;
		min-height: 100px;
		padding: 8px;
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		background-color: var(--background-secondary);
		font-family: var(--font-monospace);
		font-size: var(--font-ui-smaller);
		resize: vertical;
	}
</style>
