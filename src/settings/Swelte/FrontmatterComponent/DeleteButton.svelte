<script lang="ts" context="module">
	export type DispatchEventsDeleteButton = {
    delete: void;
};

export type DeleteFrontmatterEvent = CustomEvent<DispatchEventsDeleteButton['delete']>;

</script>

<script lang="ts">
	import { createEventDispatcher, getContext } from 'svelte';
	import { onMount } from 'svelte';
	import { setIcon } from 'obsidian';
	import { confirm } from 'obsidian-dev-utils/obsidian/Modals/Confirm';
	import type AutoClassifierPlugin from 'main';
	import { AutoClassifierPluginKey } from '../context-keys';

	const dispatch = createEventDispatcher<DispatchEventsDeleteButton>();
	let buttonEl: HTMLElement;
	const plugin = getContext<AutoClassifierPlugin>(AutoClassifierPluginKey);

	onMount(() => {
		if (buttonEl) {
			setIcon(buttonEl, 'trash-2');
		}
	});

	async function handleClick(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();

		const isDelete = await confirm({
			app: plugin.app,
			message: 'Sample confirm message',
			title: 'Sample confirm title',
		});
		if (isDelete) {
			dispatch('delete');
		}
	}
</script>

<button type="button" class="delete-frontmatter-btn" bind:this={buttonEl} on:click={handleClick}
></button>

<style>
	.delete-frontmatter-btn {
		cursor: pointer;
		background: none;
		border: none;
		color: var(--text-muted);
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-frontmatter-btn:hover {
		color: var(--text-error);
		background-color: rgba(var(--text-error-rgb), 0.1);
	}
</style>
