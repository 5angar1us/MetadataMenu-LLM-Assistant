<script lang="ts">
    import { Setting } from 'obsidian';
    import type AutoClassifierPlugin from 'main';
    import type { ProviderConfig } from 'Providers/ProvidersSetup/shared/Types';
    import { getDefaultEndpoint } from 'utils';
    
    export let plugin: AutoClassifierPlugin;
    export let provider: ProviderConfig;
    
    let settingEl: HTMLElement;
    
    function createEndpointSetting() {
      if (!settingEl) return;
      
      const endpointSetting = new Setting(settingEl)
        .setName('Endpoint')
        .setDesc('Enter the endpoint for your API')
        .addText((text) => {
          const defaultEndpoint = getDefaultEndpoint(provider.name);
          return text
            .setPlaceholder(defaultEndpoint)
            .setValue(provider?.endpoint)
            .onChange(async (value) => {
              provider.endpoint = value;
              await plugin.saveSettings();
            });
        });
  
      // Add example for custom provider
      if (provider.name === 'Custom') {
        const endpointInfo = endpointSetting.descEl.createEl('div', { cls: 'endpoint-info' });
        endpointInfo.createEl('small', {
          text: 'Example: /v1/chat/completions or /api/generate',
          cls: 'endpoint-example',
        });
      }
    }
    
    $: if (settingEl && provider) {
      settingEl.empty();
      createEndpointSetting();
    }
  </script>
  
  <div bind:this={settingEl}></div>