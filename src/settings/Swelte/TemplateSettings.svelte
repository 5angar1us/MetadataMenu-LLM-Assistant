<script lang="ts">
	import { Setting } from "obsidian";
	import { onMount, setContext } from "svelte";
	import TemplateList from "./TemplateList.svelte";
	import type AutoClassifierPlugin from "main";
	import { AutoClassifierPluginKey } from "./context-keys";

	let settingEl: HTMLElement;
	export let plugin: AutoClassifierPlugin;
	setContext(AutoClassifierPluginKey, plugin);

    function createTemplateSettings(){
        if (!settingEl) return;
        settingEl.empty();
    }

    onMount(() => {
		createTemplateSettings();
	});

	$: if (settingEl) {
		createTemplateSettings();
	}
</script>

<div bind:this={settingEl}></div>
<TemplateList></TemplateList>

<style>
</style>
