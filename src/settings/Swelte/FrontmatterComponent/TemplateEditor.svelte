<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import FileInput from './FileInput.svelte';
	import { Setting, TextComponent } from 'obsidian';
	import type { FormatTemplate, TemplateProperty } from 'Providers/ProvidersSetup/shared/Types';
	import type AutoClassifierPlugin from 'main';
	import { addFrontmatterSetting, generateId } from 'frontmatter';
	import { GetMetadataMenuApi } from 'PluginAvailability';
	import { AutoClassifierPluginKey } from '../context-keys';
	import ToggleWrapper from './ToggleWrapper.svelte';
	import { ValidatedFieldInfoSchema, type ValidatedFieldInfo } from '../../../types/metadataMenuSchemas';
	import type { SettingsChangeEvent, DeleteFrontmatter } from './FrontmatterCard.svelte';

	export let plugin: AutoClassifierPlugin;
	export let onSubmit: (format: FormatTemplate) => void;
	export let formatTemplate: FormatTemplate = {
		id: generateId(),
		name: '',
		sourceNotePath: '',
		controlFieldValue: '',
		frontmatters: [],
	};

	let outputText = '';
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
							onSubmit(formatTemplate);
						});
				});
		}
		if (formatTemplate.sourceNotePath) {
			updateSourceData(formatTemplate.sourceNotePath);
		} else {
			showInOutputTextIfDebug('No source file initially selected.')
		}
	});

	async function updateSourceData(filePath: string) {
		const mmapi = GetMetadataMenuApi(plugin.app);
		let currentOutputText = '';
		let newSourceInfo: Array<ValidatedFieldInfo> = [];

		if (!mmapi) {
			currentOutputText = 'Metadata Menu API not available.';
			if (plugin.settings.showDebugOutput) console.warn(currentOutputText);

			showInOutputTextIfDebug(currentOutputText);
		}
		if (!filePath) {
			currentOutputText = 'No file selected to analyze.';
			showInOutputTextIfDebug(currentOutputText);
		}

		const tFile = plugin.app.vault.getAbstractFileByPath(filePath);

		if (!tFile) {
			currentOutputText = `File not found: ${filePath}`;
			if (plugin.settings.showDebugOutput) console.warn(currentOutputText);
			showInOutputTextIfDebug(currentOutputText);
		}

		try {
			const rawFields = await mmapi.fileFields(filePath);
			const validatedFields: Array<ValidatedFieldInfo> = [];
			const fieldsForDebug: any[] = [];

			for (const field of Object.values(rawFields)) {
				const fieldDataToParse = {
					name: field.name,
					type: field.type, // This should align with FieldTypeSchema in metadataMenuSchemas.ts
					options: field.options || {}, // Ensure options is an object
				};
				fieldsForDebug.push(fieldDataToParse);

				const parseResult = ValidatedFieldInfoSchema.safeParse(fieldDataToParse);
				if (parseResult.success) {
					validatedFields.push(parseResult.data);
				} else {
					if (plugin.settings.showDebugOutput) {
						console.warn(
							`Validation failed for field '${field.name}' (type: ${field.type}):`,
							parseResult.error.flatten()
						);
					}
				}
			}
			newSourceInfo = validatedFields;
			currentOutputText = JSON.stringify(fieldsForDebug, null, 2);
		} catch (error) {
			currentOutputText = 'Error fetching or parsing file fields. See console for details.';
			if (plugin.settings.showDebugOutput)
				console.error(`Error processing file '${filePath}':`, error);
		}

		sourceFileFieldInfo = newSourceInfo;
		showInOutputTextIfDebug(currentOutputText)
	}

	function showInOutputTextIfDebug(currentOutputText: string) {
		if (plugin.settings.showDebugOutput) {
			outputText = currentOutputText;
		} else {
			outputText = '';
		}
	}

	// Reactive statement to handle toggling of showDebugOutput
	$: if (plugin?.settings) {
		// Ensure plugin and settings are available
		// This will re-trigger updateSourceDataAndDebugOutput if selectedFile exists,
		// or set a default message, effectively updating outputText based on showDebugOutput.
		updateSourceData(selectedFile);
	}
	let selectedFile = formatTemplate.sourceNotePath || '';

	function handleFileChange(filePath: string) {
		selectedFile = filePath;
		updateSourceData(selectedFile);
		formatTemplate.sourceNotePath = filePath;
		onSubmit(formatTemplate);
	}

	async function handleSettingsChange(event: SettingsChangeEvent) {
		const { frontmatterId, updatedFrontmatter } = event.detail;

		const index = formatTemplate.frontmatters.findIndex((f) => f.id === frontmatterId);
		if (index === -1) return;
		// Ensure reactivity by creating a new array
		const newFrontmatters = [...formatTemplate.frontmatters];
		newFrontmatters[index] = updatedFrontmatter;
		formatTemplate.frontmatters = newFrontmatters;
		onSubmit(formatTemplate);
	}

	async function handleDelete(event: DeleteFrontmatter) {
		const { frontmatterId } = event.detail;

		if (typeof frontmatterId !== 'number') {
			console.error('Failed to get frontmatterId from delete event', event.detail);
			return;
		}

		formatTemplate.frontmatters = formatTemplate.frontmatters.filter((f) => f.id !== frontmatterId);

		onSubmit(formatTemplate);
	}

	async function addNewFrontmatter() {
		const newSetting = addFrontmatterSetting();
		formatTemplate.frontmatters = [...formatTemplate.frontmatters, newSetting];
		onSubmit(formatTemplate);
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
		label="Target File"
		description="Select the file to apply frontmatter to"
		app={plugin.app}
		onChange={handleFileChange}
	/>
	{#if plugin.settings.showDebugOutput}
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
