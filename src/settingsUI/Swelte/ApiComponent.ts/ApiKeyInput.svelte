<script lang="ts">
	import { Setting } from 'obsidian';
	import type AutoClassifierPlugin from 'main';
	import type { ProviderConfig } from 'LLMProviders/ProvidersSetup/shared/Types';
	import { validateAPIKey } from 'LLMProviders/api';


	export let plugin: AutoClassifierPlugin;
	export let provider: ProviderConfig;

	let settingEl: HTMLElement;

	function createApiKeySetting() {
		if (!settingEl) return;

		const apiKeySetting = new Setting(settingEl)
			.setName('API key')
			.setDesc('Enter your API key')
			.setClass('api-key-setting')
			.addText((text) => {
				const textComponent = text
					.setPlaceholder('Enter API key')
					.setValue(provider.apiKey)
					.onChange(async (value) => {
						provider.apiKey = value;
						await plugin.saveSettings();
					});

				// Make it a password field
				textComponent.inputEl.type = 'password';

				// Add show/hide toggle
				const toggleBtn = textComponent.inputEl.parentElement?.createEl('button', {
					cls: 'show-hide-api-key',
					text: 'Show',
				});

				if (toggleBtn) {
					toggleBtn.addEventListener('click', (e) => {
						e.preventDefault();
						if (textComponent.inputEl.type === 'password') {
							textComponent.inputEl.type = 'text';
							toggleBtn.textContent = 'Hide';
						} else {
							textComponent.inputEl.type = 'password';
							toggleBtn.textContent = 'Show';
						}
					});
				}

				return textComponent;
			})
			.addButton((button) =>
				button.setButtonText('Test').onClick(async () => {
					button.setButtonText('Testing...');
					button.setDisabled(true);

					const testResult = await validateAPIKey(provider);

					apiKeySetting.setDesc(testResult.message);
					apiKeySetting.descEl.classList.add(
						testResult.success ? 'api-test-success' : 'api-test-error'
					);

					button.setButtonText('Test');
					button.setDisabled(false);

					await plugin.saveSettings();
				})
			);
	}

	$: if (settingEl && provider) {
		settingEl.empty();
		createApiKeySetting();
	}
</script>

<div bind:this={settingEl}></div>

<style>

</style>
