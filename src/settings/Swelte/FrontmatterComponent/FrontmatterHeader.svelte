<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let name: string = '';

	const dispatch = createEventDispatcher<{
		change: string;
	}>();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		name = target.value;
	}

	function handleBlur() {
		dispatch('change', name);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			(e.target as HTMLInputElement).blur();
		}
	}
</script>

<div class="frontmatter-header-container">
	<label class="frontmatter-label">Frontmatter Key</label>
	<div class="input-container">
		<input
			type="text"
			class="frontmatter-name-input"
			placeholder="tags"
			value={name}
			on:input={handleInput}
			on:blur={handleBlur}
			on:keydown={handleKeydown}
		/>
	</div>
</div>

<style>
	.frontmatter-header-container {
		width: 100%;
	}

	.frontmatter-label {
		font-size: 0.9em;
		font-weight: 600;
		color: var(--text-muted);
		margin-bottom: 8px;
		display: block;
	}

	.input-container {
		position: relative;
		display: flex;
		width: 100%;
	}

	.frontmatter-name-input {
		width: 100%;
		padding: 10px 12px;
		border-radius: 4px;
		border: none;
		background-color: var(--background-primary);
		color: var(--text-normal);
		font-size: 0.9em;
	}
</style>
