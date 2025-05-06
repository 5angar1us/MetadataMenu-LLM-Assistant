<script>
    import { createEventDispatcher } from 'svelte';
    import { setIcon } from 'obsidian';
    import { onMount } from 'svelte';
    
    export let linkType = 'Normal';
    
    const dispatch = createEventDispatcher();
    let labelEl;
    
    onMount(() => {
      if (labelEl) {
        setIcon(labelEl, 'link');
      }
    });
    
    function handleChange(e) {
      linkType = e.target.value;
      dispatch('change', linkType);
    }
  </script>
  
  <div class="control-item link-type-control">
    <div class="control-label" bind:this={labelEl}>
      <span>Link Type</span>
    </div>
    
    <select class="dropdown control-input" value={linkType} on:change={handleChange}>
      <option value="Normal">Normal</option>
      <option value="WikiLink">Wiki Link</option>
    </select>
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
    
    .dropdown {
      padding: 6px 8px;
      border-radius: 4px;
      border: 1px solid var(--background-modifier-border);
      background-color: var(--background-primary);
    }
  </style>