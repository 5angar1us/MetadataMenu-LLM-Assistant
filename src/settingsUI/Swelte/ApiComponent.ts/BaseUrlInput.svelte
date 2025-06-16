<script lang="ts">
    import { Setting } from 'obsidian';
    import type AutoClassifierPlugin from 'main';
	import type { ProviderConfig } from 'LLMProviders/ProvidersSetup/shared/Types';
    
    export let plugin: AutoClassifierPlugin;
    export let provider: ProviderConfig;
    
    let settingEl: HTMLElement;
    
    function createBaseUrlSetting() {
      if (!settingEl) return;
      
      const baseUrlSetting = new Setting(settingEl)
        .setName('Base URL')
        .setDesc('Enter the base URL for your custom API endpoint')
        .addText((text) =>
          text
            .setPlaceholder('https://api.example.com')
            .setValue(provider.baseUrl)
            .onChange(async (value) => {
              provider.baseUrl = value;
              await plugin.saveSettings();
            })
        );
  
      // Add base URL info
      const baseUrlInfo = baseUrlSetting.descEl.createEl('div', { cls: 'baseurl-info' });
      baseUrlInfo.createEl('small', {
        text: 'Examples: https://api.openai.com, http://localhost:1234, https://api.anthropic.com',
        cls: 'baseurl-example',
      });
    }
    
    $: if (settingEl && provider) {
      settingEl.empty();
      createBaseUrlSetting();
    }
  </script>
  
  <div bind:this={settingEl}></div>