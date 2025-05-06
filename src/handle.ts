import { isTagsFrontmatterTemplate, getTags, getContentWithoutFrontmatter, insertToFrontMatter, formatValuesByLinkType } from "frontmatter";
import type AutoClassifierPlugin from "main";
import { Notice, TFile, App } from "obsidian";
import { processAPIRequest } from "Providers/api";
import type { ProviderConfig, FrontmatterTemplate } from "Providers/ProvidersSetup/shared/Types";
import type { AutoClassifierSettings } from "settings";
import { getPromptTemplate, DEFAULT_CHAT_ROLE } from "utils/templates";



export async function processAllFrontmatter(plugin: AutoClassifierPlugin): Promise<void> {
    const frontmatterIds = plugin.settings.frontmatter.map((fm) => fm.id);
    for (const frontmatterId of frontmatterIds) {
        await processFrontmatter(plugin, frontmatterId);
    }
}

export async function processFrontmatter(plugin: AutoClassifierPlugin, frontmatterId: number): Promise<void> {
    const currentFile = plugin.app.workspace.getActiveFile();
    if (!currentFile) {
        new Notice('No active file.');
        return;
    }

    const selectedProvider = getSelectedProvider(plugin);
    if (!selectedProvider) {
        new Notice('No provider selected.');
        return;
    }

    const frontmatter = getFrontmatterById(plugin.settings, frontmatterId);
    if (!frontmatter) {
        new Notice(`No setting found for frontmatter ID ${frontmatterId}.`);
        return;
    }
    await processFrontmatterItem(plugin, selectedProvider, currentFile, frontmatter);
}

export async function processFrontmatterItem(
    plugin: AutoClassifierPlugin,
    selectedProvider: ProviderConfig,
    currentFile: TFile,
    frontmatter: FrontmatterTemplate
): Promise<void> {


    if (isTagsFrontmatterTemplate(frontmatter)) {
        frontmatter.refs = await getTags(plugin.app.vault.getMarkdownFiles(), plugin.app.metadataCache);
        await  plugin.saveSettings();
    }

    const currentValues = frontmatter.refs;

    const processedValues =
        frontmatter.linkType === 'WikiLink'
            ? currentValues.map((value) =>
                value.startsWith('[[') && value.endsWith(']]') ? value.slice(2, -2) : value
            )
            : currentValues;

    if (processedValues.length === 0) {
        new Notice(
            `⛔ ${plugin.manifest.name}: No current values found for frontmatter ${frontmatter.name}`
        );
        return;
    }
    const currentContent = await plugin.app.vault.read(currentFile);
    const content = getContentWithoutFrontmatter(currentContent);

    const promptTemplate = getPromptTemplate(frontmatter.count, content, processedValues);

    const chatRole = DEFAULT_CHAT_ROLE;
    const selectedModel = selectedProvider.selectedModel ||  plugin.settings.selectedModel;

    const apiResponse = await processAPIRequest(
        chatRole,
        promptTemplate,
        selectedProvider,
        selectedModel
    );

    if (apiResponse && apiResponse.reliability > 0.2) {
        const processFrontMatter = (file: TFile, fn: (frontmatter: any) => void) =>
            plugin.app.fileManager.processFrontMatter(file, fn);

        await insertToFrontMatter(processFrontMatter, {
            file: currentFile,
            key: frontmatter.name,
            value: apiResponse.output,
            overwrite: frontmatter.overwrite,
            linkType: frontmatter.linkType,
        });

        // Display the appropriate format in the notification based on linkType
        const displayOutput = formatValuesByLinkType(apiResponse.output, frontmatter.linkType)

        new Notice(
            `✅ ${apiResponse.output.length} ${frontmatter.name} added: ${displayOutput.join(', ')}`
        );
    } else if (apiResponse) {
        new Notice(
            `⛔ ${plugin.manifest.name}: Response has low reliability (${apiResponse.reliability})`
        );
    }
}

function getFrontmatterById(settings: AutoClassifierSettings, id: number) {
    return settings.frontmatter.find((fm) => fm.id === id);
}

// erase key validation
function getSelectedProvider(plugin : AutoClassifierPlugin): ProviderConfig | undefined {
    const provider = plugin.settings.providers.find((p) => p.name === plugin.settings.selectedProvider);

    // If the provider exists but doesn't have a selectedModel, set it
    if (provider && !provider.selectedModel && provider.models.length > 0) {
        provider.selectedModel = provider.models[0].name;
        plugin.saveSettings();
    }

    return provider;
}