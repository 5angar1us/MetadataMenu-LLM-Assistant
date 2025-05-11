<script lang="ts">
	import { Setting } from 'obsidian';
	import { onMount, setContext } from 'svelte';
	import TemplateList from './TemplateList.svelte';
	import type AutoClassifierPlugin from 'main';
	import { AutoClassifierPluginKey } from './context-keys';

	let settingEl: HTMLElement;
	export let plugin: AutoClassifierPlugin;
	setContext(AutoClassifierPluginKey, plugin);

	function createTemplateSettings() {
		if (!settingEl) return;
		settingEl.empty();

		new Setting(settingEl)
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
	}

	onMount(() => {
		createTemplateSettings();
	});

	// $: if (settingEl) { // Эта строка может вызывать многократное пересоздание настроек.
	// 	createTemplateSettings(); // Лучше обновлять настройки более гранулярно, если необходимо.
	// }                            // Пока оставим, но имейте в виду.
</script>

<div bind:this={settingEl}></div>
<TemplateList></TemplateList>

<style>
</style>
