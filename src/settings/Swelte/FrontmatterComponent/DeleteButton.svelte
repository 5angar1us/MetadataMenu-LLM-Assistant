<script>
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';
    import { setIcon } from 'obsidian';
    
    const dispatch = createEventDispatcher();
    let labelEl;
    let buttonEl;
    
    onMount(() => {
      if (labelEl) {
        setIcon(labelEl, 'trash-2');
      }
      if (buttonEl) {
        setIcon(buttonEl, 'trash-2');
      }
    });
    
    function handleClick(e) {
      e.stopPropagation();
      e.preventDefault();
      
      if (confirm("Are you sure you want to delete this frontmatter?")) {
        dispatch('delete');
      }
    }
  </script>
  
  <div class="control-item delete-control">
    <div class="control-label" bind:this={labelEl}>
      <span>Delete</span>
    </div>
    
    <div class="control-input delete-btn-wrapper">
      <div class="delete-frontmatter-btn" bind:this={buttonEl} on:click={handleClick}></div>
    </div>
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
    
    .delete-frontmatter-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-error);
      width: 28px;
      height: 28px;
      border-radius: 4px;
    }
    
    .delete-frontmatter-btn:hover {
      background-color: var(--background-modifier-hover);
    }
  </style>