<script>
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';
    import { setIcon } from 'obsidian';
    
    const dispatch = createEventDispatcher();
    let buttonEl;
    
    onMount(() => {
      if (buttonEl) {
        setIcon(buttonEl.querySelector('.browse-icon'), 'folder');
      }
    });
    
    function handleClick() {
      dispatch('browse');
    }
  </script>
  
  <div class="browse-button" bind:this={buttonEl} on:click={handleClick}>
    <span class="browse-icon"></span>
    <span>Browse Files</span>
  </div>
  
  <style>
    .browse-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background-color: var(--interactive-normal);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
    }
    
    .browse-button:hover {
      background-color: var(--interactive-hover);
    }
  </style>