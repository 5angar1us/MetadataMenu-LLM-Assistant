import AutoClassifierPlugin from 'main';
import { PluginSettingTab, setIcon } from 'obsidian';
import type { ProviderConfig, TemplateProperty, FormatTemplate } from 'Providers/ProvidersSetup/shared/Types';
import type { ComponentType, SvelteComponent } from 'svelte';
import TabsManager from './Swelte/TabsManager.svelte';


export interface AutoClassifierSettings {
	providers: ProviderConfig[];
	selectedProvider: string;
	selectedModel: string;
	frontmatter: TemplateProperty[]; // Changed from FrontmatterTemplate[]
	formatTemplates : FormatTemplate[];
	relevanceThreshold: number;
	defaultFolderPath:string;
	metadataMenufileClassAlias:string;
	showDebugOutput: boolean;
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
			tabsManager: {
				SvelteComponent: null,
				container: null,
				componentClass: TabsManager,
			},
			
		};
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
	
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
