<!-- TabsManager.svelte -->
<script lang="ts">
	import { onMount, onDestroy, setContext } from 'svelte';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type AutoClassifierPlugin from 'main';
	import FrontmatterManager from './FrontmatterComponent/TemplateEditor.svelte';
	import ApiSettings from './ApiComponent.ts/ApiSettings.svelte';
	import TemplateSettings from './TemplateSettings.svelte';
	import { AutoClassifierPluginKey } from './context-keys';

	export let plugin: AutoClassifierPlugin;
	

	type Tab = {
		id: string;
		title: string;
		componentClass: ComponentType;
		component: SvelteComponent | null;
	};

	const tabs: Tab[] = [
		{
			id: 'apiSettings',
			title: 'API Settings',
			componentClass: ApiSettings,
			component: null,
		},
		// {
		// 	id: 'frontmatter',
		// 	title: 'Frontmatter Manager',
		// 	componentClass: FrontmatterManager,
		// 	component: null,
		// },
		{
			id: 'TemplateSettings',
			title: 'Tempaltes',
			componentClass: TemplateSettings,
			component: null
		}
	];

	let activeTabId = tabs[0].id;
	let contentContainer: HTMLElement;

	function setActiveTab(tabId: string) {
		activeTabId = tabId;
		renderActiveComponent();
	}

	function renderActiveComponent() {
		tabs.forEach((tab) => {
			if (tab.component) {
				tab.component.$destroy();
				tab.component = null;
			}
		});

		const activeTab = tabs.find((tab) => tab.id === activeTabId);
		if (activeTab && contentContainer) {
			activeTab.component = new activeTab.componentClass({
				target: contentContainer,
				props: { plugin },
			});
		}
	}

	onMount(() => {
		renderActiveComponent();
	});

	onDestroy(() => {
		tabs.forEach((tab) => {
			if (tab.component) {
				tab.component.$destroy();
			}
		});
	});
	
</script>

<div class="tabs-container">
	<div class="tabs-header">
		{#each tabs as tab}
			<button
				class="tab-button {activeTabId === tab.id ? 'active' : ''}"
				on:click={() => setActiveTab(tab.id)}
			>
				{tab.title}
			</button>
		{/each}
	</div>

	<div class="tab-content" bind:this={contentContainer}></div>
</div>

<style>
	.tabs-container {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.tabs-header {
		display: flex;
		border-bottom: 1px solid var(--background-modifier-border);
		margin-bottom: 16px; 
	}

	.tab-button {
		padding: 8px 16px;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.3s ease;
		font-weight: 500;
	}

	.tab-button:hover {
		color: var(--text-accent);
	}

	.tab-button.active {
		border-bottom: 2px solid var(--text-accent);
		color: var(--text-accent);
	}

	.tab-content {
		flex: 1;
		padding: 8px 0;
	}
</style>
