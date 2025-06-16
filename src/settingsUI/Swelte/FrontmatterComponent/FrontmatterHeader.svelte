<script lang="ts" context="module">
	type DispatchChangeName = {
		change: {
			newName: string;
		};
	};
	export type ChangeFrontmatterTemplateName = CustomEvent<DispatchChangeName['change']>;
</script>

<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, getContext } from 'svelte';
	import { debounce, type App } from 'obsidian';
	import { AutoClassifierPluginKey, globasourceFileFieldInfo } from '../context-keys';
	import type AutoClassifierPlugin from 'main';
	import { PropertyKeySuggest } from 'settingsUI/Suggest/PropertyKeySuggest';
	import { getAllFrontmattersName } from 'settingsUI/Suggest/getAllFrontmatters';

	export let key: string = '';
	let inputEl: HTMLInputElement;
	let suggestInstance: PropertyKeySuggest;
	const plugin = getContext<AutoClassifierPlugin>(AutoClassifierPluginKey);

	// Обработчик изменений
	const dispatch = createEventDispatcher<DispatchChangeName>();
	const debouncedHandleInput = debounce((e: Event) => {
		const target = e.target as HTMLInputElement;
		key = target.value;
		dispatch('change', { newName: key });
	}, 300);

	// Инициализация саджеста
	onMount(() => {
		suggestInstance = new PropertyKeySuggest(inputEl, plugin.app);

		// Подписка на обновления хранилища
		const unsubscribe = globasourceFileFieldInfo.subscribe((fields) => {
			if (fields) {
				
				const values = getAllFrontmattersName(fields);;
				suggestInstance.setValues(values);
			}
		});

		// Очистка
		return () => {
			unsubscribe();
			suggestInstance?.close();
			(suggestInstance as any)?.inputEl?.removeEventListener('input');
		};
	});


</script>

<div class="frontmatter-header-container">
	<label class="frontmatter-label">Frontmatter Key</label>
	<div class="input-container">
		<input
			bind:this={inputEl}
			type="text"
			class="frontmatter-name-input"
			placeholder="tags"
			value={key}
			on:input={debouncedHandleInput}
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
	.frontmatter-name-input:focus {
		border-color: var(--interactive-accent);
		box-shadow: 0 0 0 2px rgba(var(--interactive-accent-rgb), 0.2);
		outline: none;
	}
</style>
