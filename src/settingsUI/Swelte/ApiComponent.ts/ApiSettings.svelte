<script lang="ts">
	import { onMount } from 'svelte';
	import type AutoClassifierPlugin from 'main';

	import ProviderSelector from './ProviderSelector.svelte';
	import ApiKeyInput from './ApiKeyInput.svelte';
	import ModelSelector from './ModelSelector.svelte';
	import EndpointInput from './EndpointInput.svelte';
	import BaseUrlInput from './BaseUrlInput.svelte';
	import type { ProviderConfig } from 'LLMProviders/ProvidersSetup/shared/Types';
	import { AIProvider } from 'LLMProviders/ProvidersSetup';

	export let plugin: AutoClassifierPlugin;

	let selectedProvider: ProviderConfig = getSelectedProvider();

	function getSelectedProvider(): ProviderConfig {
		return (
			plugin.settings.providers.find(
				(provider) => provider.name === plugin.settings.selectedProvider
			) || plugin.settings.providers[0]
		);
	}

	function handleProviderChange() {
		selectedProvider = getSelectedProvider();
	}

	onMount(() => {
		selectedProvider = getSelectedProvider();
	});
</script>

<div class="api-section-header">
	<h2>API Configuration</h2>
	<p class="api-section-description">
		Configure your AI provider settings. Custom providers require additional configuration.
	</p>
</div>

<ProviderSelector {plugin} on:providerChanged={handleProviderChange} />

<ApiKeyInput {plugin} provider={selectedProvider} />

<ModelSelector {plugin} provider={selectedProvider} />

{#if selectedProvider.name === AIProvider.Custom || selectedProvider.name === AIProvider.OpenAICustom}
	<div class="custom-provider-guide">
		<h2 class="custom-guide-header">Custom Provider Configuration</h2>
	</div>

	<BaseUrlInput {plugin} provider={selectedProvider} />

	{#if selectedProvider.name === AIProvider.Custom}
		<EndpointInput {plugin} provider={selectedProvider} />
	{/if}
{:else}
	<EndpointInput {plugin} provider={selectedProvider} />
{/if}
