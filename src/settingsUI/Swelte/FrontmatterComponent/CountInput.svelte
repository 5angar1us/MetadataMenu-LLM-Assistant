<script lang="ts" context="module">
	export type DispatchCountInput = {
		change: {
			newCount: number;
		};
	};
	export type ChangeCount = CustomEvent<DispatchCountInput['change']>;
</script>


<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { setIcon } from 'obsidian';

	export let count: number = 5;

	const dispatch = createEventDispatcher<DispatchCountInput>();
	let labelEl: HTMLElement | null = null;

	onMount(() => {
		if (labelEl) {
			setIcon(labelEl, 'hash');
		}
	});

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value, 10);
		if (!isNaN(value) && value > 0) {
			count = value;
			dispatch('change', {newCount: count});
		}
	}
</script>

<div class="control-item count-control">
	<div class="control-label-wrapper">
		<div class="control-label" bind:this={labelEl}></div>
		<span>Count</span>
	</div>

	<input
		type="number"
		class="control-input number-input"
		value={count}
		min="1"
		max="20"
		on:change={handleChange}
	/>
</div>

<style>
	.control-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.control-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.9em;
		color: var(--text-muted);
	}

	.number-input {
		width: 100%;
		text-align: center;
		font-weight: 500;
	}
</style>
