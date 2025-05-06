<script>
	import { createEventDispatcher } from 'svelte';

	export let name = '';

	const dispatch = createEventDispatcher();

	function handleInput(e) {
		name = e.target.value;
	}

	function handleBlur() {
		dispatch('change', name);
	}

	function handleKeydown(e) {
		if (e.key === 'Enter') {
			e.target.blur();
		}
	}
</script>

<div class="frontmatter-header">
	<div class="frontmatter-name-container">
		<label class="frontmatter-label">Frontmatter Key</label>
		<input
			type="text"
			class="frontmatter-name-input"
			placeholder="Enter frontmatter name"
			value={name}
			on:input={handleInput}
			on:blur={handleBlur}
			on:keydown={handleKeydown}
		/>
	</div>
</div>

<style>
	.frontmatter-header {
		margin-bottom: 12px;
	}

	.frontmatter-name-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.frontmatter-label {
		font-size: 0.9em;
		font-weight: 600;
		color: var(--text-muted);
	}

	.frontmatter-name-input {
		padding: 6px 8px;
		border-radius: 4px;
		border: 1px solid var(--background-modifier-border);
		background-color: var(--background-primary);
	}
</style>
