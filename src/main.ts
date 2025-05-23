import { isTagsFrontmatterTemplate } from "frontmatter";
import { processFrontmatters, ValidateAndProcessAllFrontmatter } from "handle";
import { Plugin, Notice, debounce, TFile, normalizePath, TAbstractFile } from "obsidian";
import { getAPI, type DataviewApi } from "obsidian-dataview";
import { initPluginContext } from "obsidian-dev-utils/obsidian/Plugin/PluginContext";
import { checkAvailabilityDataview, checkAvailabilityMetadataMenu, checkPluginAvailability, GetMetadataMenuApi, GetMetadataMenufileClassAlias as ExtractMetadataMenufileClassAlias } from "PluginAvailability";
import { type AutoClassifierSettings, AutoClassifierSettingTab, SelectFrontmatterModal } from "settings";
import { DEFAULT_SETTINGS } from "settings/DefaultSettings";
import { convertDvjsToDvQuery } from "utils/DataviewQueryConverter";
import { testQuery } from "utils/DataviewQuryConverterTests";
import { mergeDefaults } from "utils/merge-settings";
import { setPluginInstance } from "utils/pluginInstance";


export default class AutoClassifierPlugin extends Plugin {
	settings: AutoClassifierSettings;

	async onload() {
		initPluginContext(this.app, this.manifest.id);
		await this.loadSettings();
		setPluginInstance(this);

		this.app.workspace.onLayoutReady(() => {
			const dataviewAvailable = checkAvailabilityDataview(this.app);
			const metadataMenuAvailable = checkAvailabilityMetadataMenu(this.app);
			const metadataMenufileClassAlias = ExtractMetadataMenufileClassAlias(this.app);
			this.settings.metadataMenufileClassAlias = metadataMenufileClassAlias;
		});

		this.setupCommand();

		const dvapi = getAPI(this.app)! as DataviewApi;
		const mmapi = GetMetadataMenuApi(this.app);

		this.addSettingTab(new AutoClassifierSettingTab(this));

		if (this.settings.isDebug) {
			testQuery()
		}

		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on('create',
					(file) => {
						if (file instanceof TFile && this.isNeedProcessFile(file)) {
							debounce(ValidateAndProcessAllFrontmatter, 200, true)(file);
						}
					}
				));
			this.registerEvent(
				this.app.metadataCache.on('changed',
					(file) => {
						if (file instanceof TFile && this.isNeedProcessFile(file)) {
							debounce(ValidateAndProcessAllFrontmatter, 200, true)(file);
						}
					}
				));
			this.registerEvent(
				this.app.vault.on('rename',
					(file, oldPath) => {
						if (file instanceof TFile && this.isNeedProcessFile(file)) {
							debounce(ValidateAndProcessAllFrontmatter, 200, true)(file);
						}
					}
				));
		});

	}



	setupCommand() {

		this.addCommand({
			id: 'fetch-all-frontmatter',
			name: 'Fetch all frontmatter using current provider',
			callback: async () => {

				const currentFile = this.app.workspace.getActiveFile();
				if (!currentFile) {
					new Notice('No active file.');
					return;
				}
				await ValidateAndProcessAllFrontmatter(currentFile);
			},
		});
	}

	isNeedProcessFile(file: TFile) {
		return this.settings.autoProcessingEnabled && this.isFileInAutoProcessFolder(file)
	}

	isFileInAutoProcessFolder(
		file: TFile,
	): boolean {
		if (!file.parent) return false;

		const parentFolderPath = normalizePath(file.parent.path);
		const targetFolderPath = normalizePath(this.settings.autoProcessingFolderPath);

		return (
			parentFolderPath === targetFolderPath ||
			parentFolderPath.startsWith(targetFolderPath + '/')
		);
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


