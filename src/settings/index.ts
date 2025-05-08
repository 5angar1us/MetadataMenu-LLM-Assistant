import AutoClassifierPlugin from 'main';
import { PluginSettingTab, setIcon } from 'obsidian';

import { addFrontmatterSetting, isTagsFrontmatterTemplate } from 'frontmatter';

import { TagComponent } from './TagComponent';
import type { ProviderConfig, FrontmatterTemplate } from 'Providers/ProvidersSetup/shared/Types';
import type { LinkType } from 'utils/interface';
import FrontmatterManager from './Swelte/FrontmatterComponent/FrontmatterManager.svelte'
import ApiSettings from './Swelte/ApiComponent.ts/ApiSettings.svelte';
import type { ComponentType, SvelteComponent } from 'svelte';


export interface AutoClassifierSettings {
	providers: ProviderConfig[];
	selectedProvider: string;
	selectedModel: string;
	frontmatter: FrontmatterTemplate[];
}


export class AutoClassifierSettingTab extends PluginSettingTab {
	plugin: AutoClassifierPlugin;
	
	// Определение типа для управления компонентами
	private components: {
		[key: string]: {
			SvelteComponent: SvelteComponent | null;
			container: HTMLElement | null;
			componentClass: ComponentType;
		};
	};

	constructor(plugin: AutoClassifierPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		
		// Инициализация компонентов
		this.components = {
			apiSettings: {
				SvelteComponent: null,
				container: null,
				componentClass: ApiSettings,
			},
			frontmatter: {
				SvelteComponent: null,
				container: null,
				componentClass: FrontmatterManager,
			},
			
		};
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
	
		// Заголовок настроек
		containerEl.createEl('h2', { text: 'Auto Classifier Settings' });
		
		// Монтирование всех компонентов
		Object.entries(this.components).forEach(([key, component]) => {
			component.container = containerEl.createDiv({ cls: `${key}-container` });
			this.mountComponent(key);
		});
		
		// Другие настройки плагина...
	}

	mountComponent(key: string): void {
		const component = this.components[key];
		
		if (component && component.container) {
			// Уничтожаем предыдущий экземпляр, если он существует
			if (component.SvelteComponent) {
				component.SvelteComponent.$destroy();
			}
	
			// Создаем новый экземпляр
			component.SvelteComponent = new component.componentClass({
				target: component.container,
				props: {
					plugin: this.plugin
				}
			});
		}
	}
	
	hide(): void {
		// Очищаем ресурсы при закрытии настроек
		Object.values(this.components).forEach(manager => {
			if (manager.SvelteComponent) {
				manager.SvelteComponent.$destroy();
				manager.SvelteComponent = null;
			}
		});
	}
}

export * from './SelectFrontmatterModal';
export * from './WikiLinkSuggestModal';

export * from './SelectFrontmatterModal';
export * from './WikiLinkSuggestModal';
