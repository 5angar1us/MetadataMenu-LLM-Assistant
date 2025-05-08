<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FrontmatterHeader from './FrontmatterHeader.svelte';
	import LinkTypeSelector from './LinkTypeSelector.svelte';
	import OverwriteToggle from './OverwriteToggle.svelte';
	import CountInput from './CountInput.svelte';
	import DeleteButton from './DeleteButton.svelte';
	import OptionsSection from './OptionsSection.svelte';
	import type { FrontmatterTemplate } from 'Providers/ProvidersSetup/shared/Types';
	import type { DispatchEventsFrontmatterCard } from './events';

	export let frontmatterSetting: FrontmatterTemplate;
	export let frontmatterId: number;

	const dispatch = createEventDispatcher<DispatchEventsFrontmatterCard>();

	function handleSettingsChange(updatedFrontmatter: FrontmatterTemplate) {
		dispatch('settingsChange', {
			frontmatterId,
			updatedFrontmatter,
		});
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
			on:change={(e) => handleSettingsChange(frontmatterSetting)}
		></FrontmatterHeader>

		<div class="frontmatter-settings-container">
			<div class="frontmatter-controls-row">
				<OverwriteToggle
					overwrite={frontmatterSetting.overwrite}
					on:change={(e) => handleSettingsChange(frontmatterSetting)}
				/>

				<CountInput
					count={frontmatterSetting.count}
					on:change={(e) => handleSettingsChange(frontmatterSetting)}
				/>
			</div>

			<OptionsSection
				options={frontmatterSetting.refs}
				linkType={frontmatterSetting.linkType}
				on:change={(e) => handleSettingsChange({ ...frontmatterSetting, refs: e.detail })}
			/>
		</div>
	</div>
</div>

<style>
	.frontmatter-header {
		margin-bottom: 12px;
	}

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
