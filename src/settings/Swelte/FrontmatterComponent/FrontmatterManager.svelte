<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import FrontmatterCard from './FrontmatterCard.svelte';
	import { WikiLinkSelector } from '../../WikiLinkSelector';
	import FileInput from './FileInput.svelte';
	import type { Plugin } from 'obsidian';
	import type { FrontmatterTemplate } from 'Providers/ProvidersSetup/shared/Types';
	import type AutoClassifierPlugin from 'main';
	import { DEFAULT_FRONTMATTER_SETTING } from 'settings/DefaultSettings';
	import { addFrontmatterSetting } from 'frontmatter';
	import { GetMetadataMenuApi } from 'PluginAvailability';
	import type { DeleteFrontmatterEvent, SettingsChangeEvent } from './events';
	import { AutoClassifierPluginKey } from '../context-keys';

	export let plugin: AutoClassifierPlugin;

	let outputText = '';
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
	function handleFileChange(newValue: string) {
		selectedFile = newValue;
		updateOutputText(selectedFile);
	}

	let _frontmatters: FrontmatterTemplate[] = [];

	onMount(() => {
		_frontmatters = plugin.settings.frontmatter || [];
	});

	async function handleSettingsChange(event: SettingsChangeEvent) {
		const { frontmatterId, updatedFrontmatter } = event.detail;

		const index = _frontmatters.findIndex((f) => f.id === frontmatterId);
		if (index !== -1) return;
		
		_frontmatters[index] = updatedFrontmatter;

		updatedSetting(_frontmatters);
	}

	async function handleDelete(event: DeleteFrontmatterEvent) {
		const { frontmatterId } = event.detail;

		const frontmatters = _frontmatters.filter((f) => f.id !== frontmatterId);
		_frontmatters = [...frontmatters];

		updatedSetting(frontmatters);
	}

	async function updatedSetting(frontmatters : FrontmatterTemplate[]){
		plugin.settings.frontmatter = [...frontmatters];
		await plugin.saveSettings();
	}

	function handleBrowse(frontmatterId: number) {
		const wikiLinkSelector = new WikiLinkSelector(plugin.app);
		wikiLinkSelector.openFileSelector((selectedLink) => {
			const formattedLink = `[[${selectedLink}]]`;
			const index = _frontmatters.findIndex((f) => f.id === frontmatterId);

			if (index !== -1) {
				const frontmatter = _frontmatters[index];
				frontmatter.refs = [...(frontmatter.refs || []), formattedLink];

				updatedSetting(_frontmatters);
			}
		});
	}

	async function addNewFrontmatter() {
		const frontmatters = [..._frontmatters, addFrontmatterSetting()];

		_frontmatters = [...frontmatters];
		updatedSetting(frontmatters);
	}

	setContext(AutoClassifierPluginKey, plugin);
</script>

<div class="frontmatter-manager">
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
		{#each _frontmatters as frontmatter (frontmatter.id)}
			<FrontmatterCard
				frontmatterSetting={frontmatter}
				frontmatterId={frontmatter.id}
				on:settingsChange={handleSettingsChange}
				on:delete={handleDelete}
				on:browse={() => handleBrowse(frontmatter.id)}
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
