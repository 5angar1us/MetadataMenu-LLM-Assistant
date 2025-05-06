<script>
    import { createEventDispatcher } from 'svelte';
    import BrowseButton from './BrowseButton.svelte';
    
    export let options = [];
    export let linkType = 'Normal';
    
    const dispatch = createEventDispatcher();
    
    function handleChange(e) {
      const inputOptions = e.target.value
        .split(',')
        .map(option => option.trim())
        .filter(Boolean);
        
      dispatch('change', inputOptions);
    }
    
    function handleBrowse() {
      dispatch('browse');
    }
    
    function formatOptionsForDisplay() {
      return options.join(', ');
    }
  </script>
  
  <div class="options-section">
    <div class="options-header">
      <h3 class="options-title">Available Options</h3>
      
      {#if linkType === 'WikiLink'}
        <BrowseButton on:browse={handleBrowse} />
      {/if}
    </div>
    
    <p class="options-description">
      Enter values that the AI can use as suggestions, separated by commas.
    </p>
    
    <div class="textarea-container">
      <textarea 
        class="options-textarea"
        placeholder="Option1, Option2, Option3..."
        value={formatOptionsForDisplay()}
        on:change={handleChange}
      ></textarea>
    </div>
  </div>
  
  <style>
    .options-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--background-modifier-border);
    }
    
    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .options-title {
      margin: 0;
      font-size: 1.1em;
      font-weight: 600;
    }
    
    .options-description {
      margin: 0 0 12px 0;
      font-size: 0.9em;
      color: var(--text-muted);
    }
    
    .textarea-container {
      width: 100%;
    }
    
    .options-textarea {
      width: 100%;
      min-height: 80px;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--background-modifier-border);
      background-color: var(--background-primary);
      resize: vertical;
    }
  </style>