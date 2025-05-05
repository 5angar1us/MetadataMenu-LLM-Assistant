import { App, Notice, Plugin, TFile } from 'obsidian';
import { AutoClassifierSettings, AutoClassifierSettingTab, SelectFrontmatterModal } from './settings';
import { FrontmatterTemplate, ProviderConfig } from 'Providers/ProvidersSetup/shared/Types';
import { DEFAULT_SETTINGS } from 'settings/DefaultSettings';
import { processAllFrontmatter, processFrontmatter } from 'handle';
import { mergeDefaults } from 'utils/merge-settings';
import { isTagsFrontmatterTemplate } from 'frontmatter';
import { checkPluginAvailability, GetMetadataMenuApi } from 'PluginAvailability';
import { getAPI, DataviewApi } from "obsidian-dataview";

export default class AutoClassifierPlugin extends Plugin {
	settings: AutoClassifierSettings;

	async onload() {
		await this.loadSettings();

		this.app.workspace.onLayoutReady(() => {
			const dataviewAvailable = checkPluginAvailability(this.app, "dataview", "Dataview");
			const metadataMenuAvailable = checkPluginAvailability(this.app, "metadata-menu", "Metadata Menu");
		});

		this.setupCommand();

		const dvapi = getAPI(this.app)!;
		const mmapi = GetMetadataMenuApi(this.app);

		this.addSettingTab(new AutoClassifierSettingTab(this));
	}

	setupCommand() {
		// 단일 프론트매터 처리 명령
		this.addCommand({
			id: 'fetch-specific-frontmatter',
			name: 'Fetch specific frontmatter',
			callback: async () => {
				// 현재 설정된 모든 프론트매터 목록을 표시하는 모달
				const frontmatters = this.settings.frontmatter
					.filter((fm) => !isTagsFrontmatterTemplate(fm)) // 내장 태그는 별도로 처리
					.map((fm) => ({
						name: fm.name,
						id: fm.id,
					}));

				if (frontmatters.length === 0) {
					new Notice('No frontmatter settings defined. Please add some in settings.');
					return;
				}

				// 간단한 선택 모달 표시
				const modal = new SelectFrontmatterModal(
					this.app,
					frontmatters,
					async (selected: number | null) => {
						if (selected !== null) {
							await processFrontmatter(this, selected);
						}
					}
				);
				modal.open();
			},
		});

		// 태그 프론트매터 처리를 위한 별도 명령
		this.addCommand({
			id: 'fetch-tags',
			name: 'Fetch frontmatter: tags',
			callback: async () => {
				const tagsFrontmatter = this.settings.frontmatter.find((fm) => isTagsFrontmatterTemplate(fm));
				if (tagsFrontmatter) {
					await processFrontmatter(this, tagsFrontmatter.id);
				} else {
					new Notice('Tags frontmatter not found.');
				}
			},
		});

		// 모든 프론트매터 처리 명령
		this.addCommand({
			id: 'fetch-all-frontmatter',
			name: 'Fetch all frontmatter using current provider',
			callback: async () => {
				await processAllFrontmatter(this);
			},
		});
	}



	async loadSettings() {
		const loadedData = (await this.loadData()) || {};
		this.settings = mergeDefaults(DEFAULT_SETTINGS, loadedData);

		// Ensure each provider has a selectedModel property
		this.settings.providers.forEach((provider) => {
			if (!provider.selectedModel && provider.models.length > 0) {
				provider.selectedModel = provider.models[0].name;
			}
		});

		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}




}


