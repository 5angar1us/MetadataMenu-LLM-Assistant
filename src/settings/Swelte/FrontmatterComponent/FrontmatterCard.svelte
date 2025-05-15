<script lang="ts" context="module">
	type DispatchEvents = {
		settingsChange: {
			frontmatterId: number;
			updatedFrontmatter: TemplateProperty;
		};
		delete: {
			frontmatterId: number;
		};
	};

	export type SettingsChangeEvent = CustomEvent<DispatchEvents['settingsChange']>;
	export type DeleteFrontmatter = CustomEvent<DispatchEvents['delete']>; // MODIFIED: Corrected to use DispatchEvents['delete']
</script>

<script lang="ts">
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { Setting } from 'obsidian';
	import FrontmatterHeader from './FrontmatterHeader.svelte';
	import OverwriteToggle from './OverwriteToggle.svelte';
	import CountInput from './CountInput.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import AvailableOptions from './AvailableOptions.svelte';
	import type {
		TemplateProperty,
	} from 'Providers/ProvidersSetup/shared/Types';
	import type AutoClassifierPlugin from 'main';
	import { AutoClassifierPluginKey } from '../context-keys';
	import RelevanceSettings from 'settings/Swelte/FrontmatterComponent/RelevanceSettings.svelte';

	export let frontmatterSetting: TemplateProperty;
	export let frontmatterId: number;

	let expanded = true; // Default to expanded

	export function setExpanded(value: boolean) {
		expanded = value;
	}

	function toggleExpansion() {
		expanded = !expanded;
	}

	const dispatch = createEventDispatcher<DispatchEvents>();
	const plugin = getContext<AutoClassifierPlugin>(AutoClassifierPluginKey);

	// Ensure failureAction is initialized
	if (!frontmatterSetting.failureAction) {
		frontmatterSetting.failureAction = { type: 'default-value', value: '' };
	}

	function handleSettingsChange(update: Partial<TemplateProperty>) {
		// Directly merge the update into frontmatterSetting
		// Create a new object for frontmatterSetting to ensure reactivity if passed down
		// and to correctly update the object reference for Svelte's reactivity.
		const newFrontmatterSetting = { ...frontmatterSetting, ...update };

		// If failureAction is part of the update, ensure it's a new object (deep copy for failureAction)
		if (update.failureAction) {
			newFrontmatterSetting.failureAction = { ...update.failureAction };
		}
		
		// Update the reactive prop
		frontmatterSetting = newFrontmatterSetting;

		// Dispatch the fully updated frontmatterSetting object
		dispatch('settingsChange', { frontmatterId, updatedFrontmatter: frontmatterSetting });
	}
	
	onMount(() => {
		// Ensure failureAction is initialized if not already
		// This check is important if the initial frontmatterSetting might not have it
		if (!frontmatterSetting.failureAction) {
			frontmatterSetting.failureAction = { type: 'default-value', value: '' };
			// No immediate dispatch needed here, as this is initial setup.
			// The component consuming this will get the initialized version.
		}
	});

	function handleDelete() {
		// Теперь тип dispatch('delete', ...) будет правильно соотноситься с DeleteFrontmatter
		dispatch('delete', { frontmatterId }); 
	}
</script>

<div class="frontmatter-container" data-frontmatter-id={frontmatterId}>
	<div class="frontmatter-card">
		<div class="card-actions-container">
			<button
				class="toggle-details-button"
				on:click={toggleExpansion}
				title={expanded ? 'Collapse details' : 'Expand details'}
			>
				{expanded ? '[-]' : '[+]'}
			</button>
			<DeleteButton on:delete={handleDelete} />
		</div>

		<FrontmatterHeader
			key={frontmatterSetting.key}
			on:change={(e) => handleSettingsChange({ key: e.detail.newName })}
		></FrontmatterHeader>

		{#if expanded}
		<div class="frontmatter-settings-container">
			<div class="frontmatter-controls-row">
				<OverwriteToggle
					isOverwrite={frontmatterSetting.overwrite}
					on:change={(e) => handleSettingsChange({ overwrite: e.detail.isOverwrite })}
				/>

				<CountInput
					count={frontmatterSetting.count}
					on:change={(e) => handleSettingsChange({ count: e.detail.newCount })}
				/>
			</div>
			
			<RelevanceSettings
				relevance={frontmatterSetting.relevance}
				failureAction={frontmatterSetting.failureAction}
				globalRelevanceThreshold={plugin.settings.relevanceThreshold}
				on:change={(e) => handleSettingsChange(e.detail)}
			/>
			
			<AvailableOptions
				optionsMode={frontmatterSetting.optionsMode}
				options={frontmatterSetting.options}
				failureActionType={frontmatterSetting.failureAction.type}
				on:change={(e) => handleSettingsChange(e.detail)}
			/>
		</div>
		{/if}
	</div>
</div>

<style>
	.card-actions-container {
		position: absolute;
		right: 8px;
		top: 8px;
		display: flex;
		align-items: center;
		gap: 6px; /* Space between toggle and delete buttons */
	}

	.toggle-details-button {
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: var(--font-monospace, monospace);
		font-size: 1.1em;
		padding: 2px 4px;
		color: var(--text-muted);
		border-radius: var(--radius-s);
	}

	.toggle-details-button:hover {
		color: var(--text-normal);
		background-color: var(--background-modifier-hover);
	}

	.frontmatter-name-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.frontmatter-container {
		margin-bottom: 16px;
	}

	.frontmatter-card {
		border: 1px solid var(--background-modifier-border);
		border-radius: 8px;
		padding: 16px;
		background-color: var(--background-secondary);
		position: relative;
	}

	.frontmatter-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
		transform: translateY(-1px);
	}
	.frontmatter-settings-container {
		margin-top: 16px;
	}

	.frontmatter-controls-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 16px;
	}

</style>
