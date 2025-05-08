<script>
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { setIcon } from 'obsidian';

	export let overwrite = false;

	const dispatch = createEventDispatcher();
	let labelEl;

	onMount(() => {
		if (labelEl) {
			setIcon(labelEl, 'refresh-cw');
		}
	});

	function handleChange(e) {
		overwrite = e.target.checked;
		dispatch('change', overwrite);
	}
</script>

<div class="control-item overwrite-control">
	<div class="control-label-wrapper">
		<div class="control-label" bind:this={labelEl}></div>
		<span>Overwrite</span>
	</div>
	<div class="control-input toggle-wrapper">
		<label class="toggle">
			<input type="checkbox" checked={overwrite} on:change={handleChange} />
			<span class="toggle-slider"></span>
		</label>
	</div>
</div>

<style>
	.control-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.toggle {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 24px;
		cursor: pointer;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--background-modifier-border);
		border-radius: 34px;
		transition: 0.3s;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		border-radius: 50%;
		transition: 0.3s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	input:checked + .toggle-slider {
		background-color: var(--interactive-accent);
	}

	input:checked + .toggle-slider:before {
		transform: translateX(20px);
	}

	.toggle-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--control-height);
	}
</style>
