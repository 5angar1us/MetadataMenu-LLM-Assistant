<script lang="ts">
    import { Setting } from 'obsidian';
    import type AutoClassifierPlugin from 'main';
	  import { AIProvider } from 'LLMProviders/ProvidersSetup';
	  import type { ProviderConfig } from 'LLMProviders/ProvidersSetup/shared/Types';
    
    export let plugin: AutoClassifierPlugin;
    export let provider: ProviderConfig;
    
    let settingEl: HTMLElement;
    
    function createModelSetting() {
      if (!settingEl) return;
      
      const setting = new Setting(settingEl)
        .setName('Model')
        .setDesc('Select the model to use');
      
      if (provider.name === AIProvider.Custom || provider.name === AIProvider.OpenAICustom) {
        setting.addText((text) => {
          const currentModel = provider.models[0]?.name;
          return text
            .setPlaceholder('Enter model name')
            .setValue(currentModel)
            .onChange(async (value) => {
              plugin.settings.selectedModel = value;
              provider.selectedModel = value;
  
              // Ensure there's at least one model in the array
              if (provider.models.length === 0) {
                provider.models.push({ name: value });
              } else {
                provider.models[0].name = value;
              }
  
              await plugin.saveSettings();
            });
        });
  
        // Add model info for custom provider
        const modelInfo = setting.descEl.createEl('div', { cls: 'model-info' });
        modelInfo.createEl('small', {
          text: 'Example: gpt-3.5-turbo, llama2, claude-3-opus-20240229',
          cls: 'model-example',
        });
      } else {
        setting.addDropdown((dropdown) => {
          provider.models.forEach((model) => {
            dropdown.addOption(model.name, model.name);
          });
          dropdown.setValue(plugin.settings.selectedModel).onChange(async (value) => {
            plugin.settings.selectedModel = value;
            provider.selectedModel = value;
            await plugin.saveSettings();
          });
        });
      }
    }
    
    $: if (settingEl && provider) {
      settingEl.empty();
      createModelSetting();
    }
  </script>
  
  <div bind:this={settingEl}></div>