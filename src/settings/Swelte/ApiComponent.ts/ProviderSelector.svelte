<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Setting } from 'obsidian';
    import type AutoClassifierPlugin from 'main';
    
    export let plugin: AutoClassifierPlugin;
    
    const dispatch = createEventDispatcher();
    let settingEl: HTMLElement;
    
    function createProviderDropdown() {
      if (settingEl) {
        const setting = new Setting(settingEl)
          .setName('API provider')
          .setDesc('Select the API provider')
          .addDropdown((dropdown) => {
            plugin.settings.providers.forEach((provider) => {
              dropdown.addOption(provider.name, provider.name);
            });
            dropdown.setValue(plugin.settings.selectedProvider).onChange(async (value) => {
              // Store the current model selection for the previous provider
              const previousProvider = plugin.settings.providers.find(
                (p) => p.name === plugin.settings.selectedProvider
              );
              if (previousProvider) {
                previousProvider.selectedModel = plugin.settings.selectedModel;
              }
  
              // Update the selected provider
              plugin.settings.selectedProvider = value;
  
              // Get the new provider
              const newProvider = plugin.settings.providers.find((p) => p.name === value);
              if (newProvider) {
                // Use the stored model if available, otherwise use the first model
                if (newProvider.selectedModel) {
                  plugin.settings.selectedModel = newProvider.selectedModel;
                } else if (newProvider.models.length > 0) {
                  plugin.settings.selectedModel = newProvider.models[0].name;
                  newProvider.selectedModel = newProvider.models[0].name;
                }
              }
  
              await plugin.saveSettings();
              dispatch('providerChanged');
            });
          });
      }
    }
    
    $: if (settingEl) {
      createProviderDropdown();
    }
  </script>
  
  <div bind:this={settingEl}></div>