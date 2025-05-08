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
		width: 36px;
		height: 18px;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--background-modifier-border);
		border-radius: 18px;
		transition: 0.3s;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 14px;
		width: 14px;
		left: 2px;
		bottom: 2px;
		background-color: var(--background-primary);
		border-radius: 50%;
		transition: 0.3s;
	}

	input:checked + .toggle-slider {
		background-color: var(--interactive-accent);
	}

	input:checked + .toggle-slider:before {
		transform: translateX(18px);
	}
</style>
