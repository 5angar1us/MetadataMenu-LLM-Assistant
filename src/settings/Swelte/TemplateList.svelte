<script lang="ts">
	import type AutoClassifierPlugin from 'main';
	import { Setting } from 'obsidian';
	import type { FormatTemplate } from 'Providers/ProvidersSetup/shared/Types';
	import { createEventDispatcher, getContext, onMount } from 'svelte';
	import { AutoClassifierPluginKey } from './context-keys';
	import { arraySwap } from 'utils/arraySwap';
	import { TemplateEditorModal } from './TemplateEditorModal';

	const plugin = getContext<AutoClassifierPlugin>(AutoClassifierPluginKey);
	let templates: FormatTemplate[] = plugin.settings.formatTemplates;
	let containerEl: HTMLElement;

	function addElement() {
		const modal = new TemplateEditorModal(plugin.app, plugin, (newFormatTemplate) => {
			plugin.settings.formatTemplates.push(newFormatTemplate);
			templates = plugin.settings.formatTemplates;
			plugin.saveSettings();
		});
		modal.open();
	}

	function editElement(template: FormatTemplate, index: number) {
		const onSubmit = (newFormatTemplate: FormatTemplate) => {
			plugin.settings.formatTemplates[index] = newFormatTemplate;
			templates = plugin.settings.formatTemplates;
			plugin.saveSettings();
		};

		const modal = new TemplateEditorModal(plugin.app, plugin, onSubmit, template);
		modal.open();
	}

	async function moveUpElement(index: number) {
		arraySwap(plugin.settings.formatTemplates, index, index - 1);
		templates = plugin.settings.formatTemplates;
		await plugin.saveSettings();
	}

	async function moveDownElement(index: number) {
		arraySwap(plugin.settings.formatTemplates, index, index + 1);
		templates = plugin.settings.formatTemplates;
		await plugin.saveSettings();
	}

	async function deleteElement(index: number) {
		plugin.settings.formatTemplates.splice(index, 1);
		templates = plugin.settings.formatTemplates;
		await plugin.saveSettings();
	}

	function createTemplateList() {
		const descEl = document.createDocumentFragment();
		const ruleDesc = document.createDocumentFragment();

		ruleDesc.append();

		new Setting(containerEl).setDesc(ruleDesc);

		new Setting(containerEl).setName('Add new Format').addButton((button) => {
			button.setTooltip('Add new Format').setButtonText('+').setCta().onClick(addElement);
		});

		templates.forEach((template, index) => {
			const s = new Setting(containerEl).setName(template.name);

			s.addButton((button) => {
				button.setButtonText('Edit').onClick(() => editElement(template, index));
			});

			s.addExtraButton((cb) => {
				cb.setIcon('up-chevron-glyph')
					.setTooltip('Move up')
					.onClick(() => moveUpElement(index));
			});

			s.addExtraButton((cb) => {
				cb.setIcon('down-chevron-glyph')
					.setTooltip('Move down')
					.onClick(() => moveDownElement(index));
			});

			s.addExtraButton((cb) => {
				cb.setIcon('cross')
					.setTooltip('Delete')
					.onClick(() => deleteElement(index));
			});
		});
	}

	onMount(() => {
		if (!containerEl) return;
		containerEl.empty();

		createTemplateList();
	});

	$: if (containerEl && templates) {
		setTimeout(() => {
			containerEl.empty();
			createTemplateList();
		}, 0);
	}
</script>

<div bind:this={containerEl}></div>

<style>
</style>
