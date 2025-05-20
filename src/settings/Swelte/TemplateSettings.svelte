<script lang="ts">
	import { Setting } from 'obsidian';
	import { onMount, setContext } from 'svelte';
	import TemplateList from './TemplateList.svelte';
	import type AutoClassifierPlugin from 'main';
	import { AutoClassifierPluginKey } from './context-keys';

	
	export let plugin: AutoClassifierPlugin;
	setContext(AutoClassifierPluginKey, plugin);
	let settingElTop: HTMLElement;
	let settingElBottom: HTMLElement;

	function createTopSettings() {
		if (!settingElTop) return;
		settingElTop.empty();
		new Setting(settingElTop)
			.setName('FileClass alias for Metadata Menu')
			.setDesc(
				'This alias is used to define fileClass in the Metadata Menu plugin. ' +
					'It is read from Metadata Menu settings when Auto Classifier plugin loads and used for integration. ' +
					'This value cannot be changed here, it is for informational purposes only.'
			)
			.addText((text) =>
				text
					.setValue(
						plugin.settings.metadataMenufileClassAlias ||
							'Not defined or Metadata Menu is not active'
					)
					.setDisabled(true)
			);
		

		new Setting(settingElTop)
			.setName('Global Relevance Threshold')
			.setDesc(
				'Default relevance threshold for new frontmatter templates (0.0 to 1.0). This value is used if a specific frontmatter does not have its own threshold set.'
			)
			.addSlider((slider) => {
				slider
					.setLimits(0, 1, 0.01) // min, max, step
					.setValue(plugin.settings.relevanceThreshold)
					.setDynamicTooltip()
					.onChange(async (value) => {
						plugin.settings.relevanceThreshold = value;
						await plugin.saveSettings();
					});
			});
		const descEl = document.createDocumentFragment();
		const desc = document.createDocumentFragment();
		desc.append(
			'Specify the folder path where the file will be moved',
			' if it does not meet the relevance threshold.',
			descEl.createEl('br'),
			descEl.createEl('strong', { text: 'Note: ' }),
			'This option is applied when the "Move to Folder" action is selected',
			' in the "Action on Relevance Threshold Failure" drop down',
			' for at least one frontmatter in template.'
		);

		

		

		new Setting(settingElTop)
			.setName('Enable Auto Processing')
			.setDesc('Enable automatic processing of files in the specified folder.')
			.addToggle(toggle => {
				toggle
					.setValue(plugin.settings.autoProcessingEnabled)
					.onChange(async (value) => {
						plugin.settings.autoProcessingEnabled = value;
						await plugin.saveSettings();
					});
			});

		new Setting(settingElTop)
			.setName('Auto Processing Folder Path')
			.setDesc('Specify the folder path for automatic processing. Files in this folder will be processed automatically.')
			.addText(text =>
				text
					.setPlaceholder('Enter folder path for auto processing')
					.setValue(plugin.settings.autoProcessingFolderPath)
					.onChange(async (value) => {
						plugin.settings.autoProcessingFolderPath = value;
						await plugin.saveSettings();
					})
			);
		new Setting(settingElTop)
			.setName('Folder Path for Irrelevant Files')
			.setDesc(desc)
			.addText(
				(
					text // Placeholder for FileSuggest or similar
				) =>
					text
						.setPlaceholder('Enter folder path')
						.setValue(plugin.settings.defaultFolderPath)
						.onChange(async (value) => {
							plugin.settings.defaultFolderPath = value;
							await plugin.saveSettings();
						})
			);
		
	}
	function createBottomSettings() {
		if (!settingElBottom) return;
		settingElBottom.empty();
		new Setting(settingElBottom)
			.setHeading();
		new Setting(settingElBottom)
			.setName('Enable Debug Mode')
			.setDesc('Show additional debug information')
			.addToggle(toggle => {
				toggle
					.setValue(plugin.settings.isDebug)
					.onChange(async (value) => {
						plugin.settings.isDebug = value;
						await plugin.saveSettings();
					});
			});
	}

	onMount(() => {
		createTopSettings();
		createBottomSettings();
	});
</script>

<div bind:this={settingElTop}></div>
<TemplateList></TemplateList>
<div bind:this={settingElBottom}></div>
<style>
</style>
