<script>
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';
    import { setIcon } from 'obsidian';
    
    export let count = 5;
    
    const dispatch = createEventDispatcher();
    let labelEl;
    
    onMount(() => {
      if (labelEl) {
        setIcon(labelEl, 'hash');
      }
    });
    
    function handleChange(e) {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        count = value;
        dispatch('change', count);
      }
    }
  </script>
  
  <div class="control-item count-control">
    <div class="control-label" bind:this={labelEl}>
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
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid var(--background-modifier-border);
      background-color: var(--background-primary);
      width: 60px;
    }
  </style>