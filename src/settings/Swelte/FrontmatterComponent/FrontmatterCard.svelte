<script>
    import { createEventDispatcher } from 'svelte';
    import FrontmatterHeader from './FrontmatterHeader.svelte';
    import LinkTypeSelector from './LinkTypeSelector.svelte';
    import OverwriteToggle from './OverwriteToggle.svelte';
    import CountInput from './CountInput.svelte';
    import DeleteButton from './DeleteButton.svelte';
    import OptionsSection from './OptionsSection.svelte';
  
    export let frontmatterSetting;
    export let frontmatterId;
  
    const dispatch = createEventDispatcher();
  
    function handleSettingsChange(updatedSetting) {
      dispatch('settingsChange', { 
        frontmatterId, 
        updatedSetting 
      });
    }
  
    function handleDelete() {
      dispatch('delete', { frontmatterId });
    }
  </script>
  
  <div class="frontmatter-container" data-frontmatter-id={frontmatterId}>
    <div class="frontmatter-card">
      <FrontmatterHeader 
        name={frontmatterSetting.name} 
        on:change={(e) => handleSettingsChange({...frontmatterSetting, name: e.detail})} 
      />
      
      <div class="frontmatter-settings-container">
        <div class="frontmatter-controls-row">
          <LinkTypeSelector 
            linkType={frontmatterSetting.linkType} 
            on:change={(e) => handleSettingsChange({...frontmatterSetting, linkType: e.detail})} 
          />
          
          <OverwriteToggle 
            overwrite={frontmatterSetting.overwrite} 
            on:change={(e) => handleSettingsChange({...frontmatterSetting, overwrite: e.detail})} 
          />
          
          <CountInput 
            count={frontmatterSetting.count} 
            on:change={(e) => handleSettingsChange({...frontmatterSetting, count: e.detail})} 
          />
          
          <DeleteButton on:delete={handleDelete} />
        </div>
        
        <OptionsSection 
          options={frontmatterSetting.refs} 
          linkType={frontmatterSetting.linkType} 
          on:change={(e) => handleSettingsChange({...frontmatterSetting, refs: e.detail})} 
        />
      </div>
    </div>
  </div>
  
  <style>
    .frontmatter-container {
      margin-bottom: 16px;
    }
  
    .frontmatter-card {
      border: 1px solid var(--background-modifier-border);
      border-radius: 8px;
      padding: 16px;
      background-color: var(--background-secondary);
    }
  
    .frontmatter-settings-container {
      margin-top: 16px;
    }
  
    .frontmatter-controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
  </style>