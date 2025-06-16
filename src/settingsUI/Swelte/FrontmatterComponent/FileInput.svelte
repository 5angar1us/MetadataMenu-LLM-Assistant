<script lang="ts">
	import { onMount } from 'svelte';
	import { App, SearchComponent, Setting } from 'obsidian';
	import { FileSuggest } from '../../Suggest/FileSuggest';

	export let value = '';
	export let placeholder = 'Search for file';
	export let label = 'File';
	export let description = '';
	export let app: App;
	export let onChange = (val: string) => {};

	let settingEl: HTMLElement;
	let search: SearchComponent;

	function createFileSearchSetting() {
		if (!settingEl) return;

		settingEl.empty();

		new Setting(settingEl)
			.setName(label)
			.setDesc(description)
			.setHeading();
		new Setting(settingEl)
			.addSearch((cb) => {
				search = cb;

				// Инициализируем FileSuggest для автодополнения файлов
				new FileSuggest(cb.inputEl, app);

				cb.setValue(value)
					.setPlaceholder(placeholder)
					.onChange(async (newValue) => {
						value = newValue;
						onChange(newValue);
					});
				//cb.inputEl.classList.add('-input');
				// @ts-ignore
                cb.containerEl.addClass('full-width');
			})
			.infoEl.remove();
	}

	onMount(() => {
		createFileSearchSetting();
	});

	$: if (settingEl && app) {
		createFileSearchSetting();
	}
</script>

<div bind:this={settingEl}></div>

<style>


</style>
