<script lang="ts" context="module">
	type DispatchEventsFrontmatterCard = {
		settingsChange: {
			frontmatterId: number;
			updatedFrontmatter: FrontmatterTemplate;
		};
		delete: {
			frontmatterId: number;
		};
	};

	export type SettingsChangeEvent = CustomEvent<DispatchEventsFrontmatterCard['settingsChange']>;
	export type DeleteFrontmatter = CustomEvent<DispatchEventsFrontmatterCard['settingsChange']>;
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FrontmatterHeader from './FrontmatterHeader.svelte';
	import OverwriteToggle from './OverwriteToggle.svelte';
	import CountInput from './CountInput.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import OptionsSection from './OptionsSection.svelte';
	import type { FrontmatterTemplate } from 'Providers/ProvidersSetup/shared/Types';

	export let frontmatterSetting: FrontmatterTemplate;
	export let frontmatterId: number;

	const dispatch = createEventDispatcher<DispatchEventsFrontmatterCard>();

	function handleSettingsChange(update: Partial<FrontmatterTemplate>) {
		const updatedFrontmatter = { ...frontmatterSetting, ...update };
		dispatch('settingsChange', { frontmatterId, updatedFrontmatter });
	}

	function handleDelete() {
		dispatch('delete', { frontmatterId });
	}
</script>

<div class="frontmatter-container" data-frontmatter-id={frontmatterId}>
	<div class="frontmatter-card">
		<div class="delete-button-container">
			<DeleteButton on:delete={handleDelete} />
		</div>

		<FrontmatterHeader
			name={frontmatterSetting.name}
			on:change={(e) => handleSettingsChange({ name: e.detail.newName })}
		></FrontmatterHeader>

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

			<OptionsSection
				options={frontmatterSetting.refs}
				linkType={frontmatterSetting.linkType}
				on:change={(e) => handleSettingsChange({ refs: e.detail.newOption })}
			/>
		</div>
	</div>
</div>

<style>
	.delete-button-container {
		position: absolute;
		right: 8px;
		top: 8px;
		transform: none;
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
