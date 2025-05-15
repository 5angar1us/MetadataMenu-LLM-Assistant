<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import FrontmatterCard, {
		type DeleteFrontmatter,
		type SettingsChangeEvent,
	} from './FrontmatterCard.svelte';
	import { WikiLinkSelector } from '../../WikiLinkSelector';
	import FileInput from './FileInput.svelte';
	import type { Plugin } from 'obsidian';
	import { Setting, TextComponent } from 'obsidian';
	import type { FormatTemplate} from 'Providers/ProvidersSetup/shared/Types';
	import type AutoClassifierPlugin from 'main';
	import { DEFAULT_FRONTMATTER_PROPERTY_SETTINGS } from 'settings/DefaultSettings';
	import { addFrontmatterSetting, generateId } from 'frontmatter';
	import { GetMetadataMenuApi } from 'PluginAvailability';
	import { AutoClassifierPluginKey } from '../context-keys';
	import type { DeleteFrontmatterEvent } from './DeleteButton.svelte';
	import { lineNumberWidgetMarker } from '@codemirror/view';

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

	setContext(AutoClassifierPluginKey, plugin);
	onMount(() => {
		if (templateNameContainer) {
			new Setting(templateNameContainer)
				.setName('Template Name')
				.setDesc('Enter a name for this template configuration.')
				.addText((text: TextComponent) => {
					text.setPlaceholder('E.g., Meeting Notes Template')
						.setValue(formatTemplate.name)
						.onChange(async (value) => {
							formatTemplate.name = value;
							onSubmit(formatTemplate);
						});
				});
		}
	});

	async function updateOutputText(newText: string) {
		const mmapi = GetMetadataMenuApi(plugin.app);
		const t = await mmapi.fileFields(newText);
		const t2 = Object.values(t);
		const t3 = t2.map((field) => ({
			name: field.name,
			type: field.type,
			options: field.options,
		}));
		const t4 = JSON.stringify(t3);

		outputText = t4;
	}

	let selectedFile = '';
	function handleFileChange(filePath: string) {
		selectedFile = filePath;
		updateOutputText(selectedFile);
		formatTemplate.sourceNotePath = filePath;
		onSubmit(formatTemplate);
	}

	async function handleSettingsChange(event: SettingsChangeEvent) {
		const { frontmatterId, updatedFrontmatter } = event.detail;

		const index = formatTemplate.frontmatters.findIndex((f) => f.id === frontmatterId);
		if (index === -1) return;
		formatTemplate.frontmatters[index] = updatedFrontmatter;
		onSubmit(formatTemplate);
	}

	async function handleDelete(event: DeleteFrontmatter) {
		const { frontmatterId } = event.detail;

		const filteredFrontmatters = formatTemplate.frontmatters.filter((f) => f.id !== frontmatterId);
		formatTemplate.frontmatters = [...filteredFrontmatters];
		onSubmit(formatTemplate);
	}

	async function addNewFrontmatter() {
		const frontmatters = [...formatTemplate.frontmatters, addFrontmatterSetting()];

		formatTemplate.frontmatters = [...frontmatters];
		onSubmit(formatTemplate);
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

	<div class="frontmatter-list">
		{#each formatTemplate.frontmatters as frontmatter (frontmatter.id)}
			<FrontmatterCard
				frontmatterSetting={frontmatter}
				frontmatterId={frontmatter.id}
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
</style>
