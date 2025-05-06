import AutoClassifierPlugin from 'main';
import { PluginSettingTab, setIcon } from 'obsidian';

import { addFrontmatterSetting, isTagsFrontmatterTemplate } from 'frontmatter';

import { ApiComponent } from './ApiComponent';
import { FrontmatterComponent } from './FrontmatterComponent';
import { TagComponent } from './TagComponent';
import type { ProviderConfig, FrontmatterTemplate } from 'Providers/ProvidersSetup/shared/Types';
import type { LinkType } from 'utils/interface';


export interface AutoClassifierSettings {
	providers: ProviderConfig[];
	selectedProvider: string;
	selectedModel: string;
	frontmatter: FrontmatterTemplate[];
}

export class AutoClassifierSettingTab extends PluginSettingTab {
	plugin: AutoClassifierPlugin;
	apiSetting: ApiComponent;
	tagSetting: TagComponent;
	frontmatterSetting: FrontmatterComponent;
	constructor(plugin: AutoClassifierPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;

		this.apiSetting = new ApiComponent(plugin);
		this.tagSetting = new TagComponent(plugin);
		this.frontmatterSetting = new FrontmatterComponent(plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const apiSettingContainer = containerEl.createDiv();
		this.apiSetting.display(apiSettingContainer);

		// Tags section
		const tagSectionContainer = containerEl.createDiv({ cls: 'section-container tag-section' });
		tagSectionContainer.createEl('h2', { text: 'Tags', cls: 'section-heading' });
		const tagContainer = tagSectionContainer.createDiv();
		this.tagSetting.display(tagContainer);

		// Custom frontmatter section
		const fmSectionContainer = containerEl.createDiv({
			cls: 'section-container frontmatter-section',
		});

		// 섹션 헤더와 추가 버튼을 하나의 컨테이너에 배치
		const fmHeaderContainer = fmSectionContainer.createDiv({ cls: 'section-header-container' });

		// 헤더 제목
		fmHeaderContainer.createEl('h2', { text: 'Custom Frontmatter', cls: 'section-heading' });

		// 단순화된 추가 버튼
		const addButton = fmHeaderContainer.createDiv({ cls: 'add-frontmatter-simple-btn' });
		setIcon(addButton, 'plus');
		addButton.createSpan({ text: 'Add Frontmatter' });

		addButton.addEventListener('click', () => {
			this.addNewFrontmatter(containerEl, 'Normal');
		});

		// Create a container for all frontmatter items
		const frontmattersContainer = fmSectionContainer.createDiv({ cls: 'frontmatters-container' });

		this.plugin.settings.frontmatter.forEach((frontmatter) => {
			if (!isTagsFrontmatterTemplate(frontmatter)) {
				const frontmatterContainer = frontmattersContainer.createDiv({
					cls: 'frontmatter-container',
				});
				frontmatterContainer.setAttribute('data-frontmatter-id', frontmatter.id.toString());
				this.frontmatterSetting.display(frontmatterContainer, frontmatter.id);
			}
		});
	}

	private addNewFrontmatter(containerEl: HTMLElement, linkType: LinkType): void {
		const newFrontmatter = addFrontmatterSetting(linkType);
		this.plugin.settings.frontmatter.push(newFrontmatter);
		this.plugin.saveSettings();

		// Find the frontmatters container to add the new frontmatter to
		const frontmattersContainer = containerEl.querySelector('.frontmatters-container');
		if (!frontmattersContainer) return;

		const newFrontmatterContainer = document.createElement('div');
		newFrontmatterContainer.className = 'frontmatter-container';
		newFrontmatterContainer.setAttribute('data-frontmatter-id', newFrontmatter.id.toString());

		frontmattersContainer.appendChild(newFrontmatterContainer);
		this.frontmatterSetting.display(newFrontmatterContainer as HTMLElement, newFrontmatter.id);

		// Scroll the new frontmatter into view
		newFrontmatterContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

		// Add a temporary highlight to make it clear which one was added
		newFrontmatterContainer.addClass('newly-added');
		setTimeout(() => newFrontmatterContainer.removeClass('newly-added'), 2000);
	}
}

export * from './SelectFrontmatterModal';
export * from './WikiLinkSuggestModal';
