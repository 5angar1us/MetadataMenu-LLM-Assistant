import AutoClassifierPlugin from 'main';
import { PluginSettingTab, setIcon } from 'obsidian';
import type { ProviderConfig } from 'Providers/ProvidersSetup/shared/Types';
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
	autoProcessingEnabled: boolean;
	autoProcessingFolderPath: string;
	isDebug: boolean;
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
// Defines how options are used for validation or suggestion

export type OptionsMode = 'all' | 'whitelist' | 'blacklist';
// Defines the types of actions to take if relevance threshold is not met

export type FailureActionType = 'default-value' |
	'add-tag' |
	'set-other-property' |
	'move-to-folder';
// Base interface for failure actions

export interface FailureActionBase {
	type: FailureActionType;
}
// Action to set a default value from the predefined options

export interface FailureActionDefaultValue extends FailureActionBase {
	type: 'default-value';
	value: string; // Value selected from 'options' or a custom suggest-input
}
// Action to set another property on the note


export interface FailureActionSetOtherProperty extends FailureActionBase {
	type: 'set-other-property';
	targetKey: string; // Key of the property to set, suggest-input
	targetValue: string; // Value to set for the targetKey, suggest-input (context-aware)
}
// Action to move the note to a specified folder

export interface FailureActionMoveToFolder extends FailureActionBase {
	type: 'move-to-folder';
	folder: string; // Destination folder path, suggest-input (SearchComponent)
}
// Union type for all possible failure actions

export type FailureAction = FailureActionDefaultValue |
	FailureActionSetOtherProperty |
	FailureActionMoveToFolder;

export type OptionItem = string & { __brand: "OptionItem"; };

export function ToOptions(values: string[]) {
	return values.map(asOptionItem);
}
export function asOptionItem(value: string): OptionItem {
	return value as OptionItem;
}

export interface TemplateProperty {
	id: number; // uuid
	key: string; // frontmatter key
	overwrite: boolean;
	count?: number; // >=0, if the type supports multiple values
	relevance?: number; // 0…1, specific relevance threshold for this property
	failureAction: FailureAction; // Action to take if relevance threshold is not met
	optionsMode: OptionsMode; // How the 'options' array is to be interpreted
	options?: OptionItem[]; // List of predefined values (e.g., for dropdowns, validation)
	optionsDescription?: string; // Free text description for the options (e.g., explaining their source or purpose)
}

export interface FormatTemplate {
	id: number; // uuid
	name: string;
	sourceNotePath: string; // «Источник свойств»
	controlFieldValue: string; // «Значение управляющего поля» (readonly)
	frontmatters: TemplateProperty[];
}

export * from './WikiLinkSuggestModal';
