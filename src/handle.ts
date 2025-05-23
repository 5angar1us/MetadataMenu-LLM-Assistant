import { file, functionTypeAnnotation } from "@babel/types";
import { isTagsFrontmatterTemplate, getTags, getContentWithoutFrontmatter as ExtractContentWithoutFrontmatter, insertToFrontMatter, formatValuesByLinkType, TAG_FRONMATTER_NAME, getFrontmatter } from "frontmatter";
import type AutoClassifierPlugin from "main";
import { Notice, TFile, App } from "obsidian";
import { processAPIRequest } from "Providers/api";
import { type ProviderConfig } from "Providers/ProvidersSetup/shared/Types";
import { asOptionItem, ToOptions, type TemplateProperty } from "settings";
import type { AutoClassifierSettings, FailureActionDefaultValue, FailureActionSetOtherProperty, FormatTemplate, OptionItem } from "settings";
import { getAllTags } from "settings/Suggest/getAllTags";
import type { RichField } from "types/metadataMenuUtils";
import { getPluginInstance } from "utils/pluginInstance";
import { getPromptTemplate as CreatePromptTemplate, DEFAULT_CHAT_ROLE } from "utils/templates";



export async function ValidateAndProcessAllFrontmatter(currentFile: TFile): Promise<void> {
    const plugin = getPluginInstance();

    let selectedProvider = getSelectedProvider();
    selectedProvider = selectedProvider;
    if (!selectedProvider) {
        return;
    }


    const formatTemplates = plugin.settings.formatTemplates;
    const targetFrontmatterKey = plugin.settings.metadataMenufileClassAlias;

    const targetFrontmatterValue = getFrontmatter(currentFile, targetFrontmatterKey) as string;
    if (!targetFrontmatterValue) return;

    const hasTargetFile = formatTemplates
        .some(x => x.controlFieldValue === targetFrontmatterValue);

    if (!hasTargetFile) return;

    const targetTemplate = formatTemplates.find(x => x.controlFieldValue == targetFrontmatterValue)
    if (!targetTemplate) return;

    processFrontmatters(selectedProvider, currentFile, targetTemplate);
}



export async function processFrontmatters(
    selectedProvider: ProviderConfig,
    currentFile: TFile,
    targetTemplate: FormatTemplate,): Promise<void> {

    for (const frontmatter of targetTemplate.frontmatters) {
        await processFrontmatterItem(selectedProvider, currentFile, frontmatter, targetTemplate.RichField!,);
    }
}
export async function processFrontmatterItem(
    selectedProvider: ProviderConfig,
    currentFile: TFile,
    frontmatter: TemplateProperty,
    richFilds: RichField[]
): Promise<void> {
    const plugin = getPluginInstance();

    const options = getOptions(frontmatter, richFilds);
    if (options.length == 0) return;

    const maxCount = frontmatter.MaxCount;
    if (!maxCount) return

    const targetValueCount = CalculateTargetValueCount(currentFile, frontmatter, maxCount);
    if (!targetValueCount || targetValueCount <= 0) return

    const content = await ReadFileContent(currentFile);

    const promptTemplate = CreatePromptTemplate(frontmatter.key, targetValueCount, content, options);

    const chatRole = DEFAULT_CHAT_ROLE;
    const selectedModel = selectedProvider.selectedModel!
    const apiResponse = await processAPIRequest(
        chatRole,
        promptTemplate,
        selectedProvider,
        selectedModel
    );

    if (!apiResponse) {
        new Notice(
            `⛔ ${plugin.manifest.name}: No api response`
        );

        await MoveFileInDefaultPath(currentFile)
        return;
    }

    const targetReliability = getReliability(frontmatter);

    if (apiResponse.reliability >= targetReliability) {
        await insertToFrontMatter(
            currentFile,
            frontmatter.key,
            apiResponse.output,
            false,
        );

        const displayOutput = apiResponse.output;

        new Notice(
            `✅ ${apiResponse.output.length} ${frontmatter.key} added: ${displayOutput.join(', ')}`
        );
    } else {
        if (frontmatter.failureAction.type === 'default-value') {
            const value = (frontmatter.failureAction as FailureActionDefaultValue).value;
            await insertToFrontMatter(
                currentFile,
                frontmatter.key,
                [value],
                true,
            );
        }
        else if (frontmatter.failureAction.type === 'move-to-folder') {
            await MoveFileInDefaultPath(currentFile)
        }
        else if (frontmatter.failureAction.type === "set-other-property") {
            const action = (frontmatter.failureAction as FailureActionSetOtherProperty);
            const key = action.targetKey;
            const value = action.targetValue;

            await insertToFrontMatter(
                currentFile,
                key,
                [value],
                true,
            );
        }
    }
}

function CalculateTargetValueCount(currentFile: TFile, frontmatter: TemplateProperty, maxCount: number) {
    let elementCountNow = 0;
    if (!frontmatter.overwrite) {
        elementCountNow = GetFrontmatterElementCount(currentFile, frontmatter)
    }
    const targetValueCount = maxCount - elementCountNow;

    return targetValueCount;
}

function GetFrontmatterElementCount(currentFile: TFile, frontmatter: TemplateProperty,) {
    const DEFAULT_ELEMNT_COUNT = 0;
    const targetFrontmatterValue = getFrontmatter(currentFile, frontmatter.key)
    if (!targetFrontmatterValue) return DEFAULT_ELEMNT_COUNT;

    //TODO: debug
    if (Array.isArray(targetFrontmatterValue)) {
        return targetFrontmatterValue.length;
    }
    if (typeof targetFrontmatterValue === 'string' && targetFrontmatterValue.trim() !== '') {
        return 1
    }
    throw new UnreachableCodeError();
}

async function MoveFileInDefaultPath(currentFile: TFile,) {
    const plugin = getPluginInstance();

    // Avoid using vault.rename(), as it does not automatically update or rename links pointing to the renamed file.
    await plugin.app.fileManager.renameFile(currentFile, plugin.settings.defaultFolderPath);
}

async function ReadFileContent(currentFile: TFile) {
    const plugin = getPluginInstance();

    const currentContent = await plugin.app.vault.read(currentFile);
    const content = ExtractContentWithoutFrontmatter(currentContent);

    return content;
}

function getReliability(frontmatter: TemplateProperty) {
    const plugin = getPluginInstance();

    let targetReliability = plugin.settings.relevanceThreshold;
    if (frontmatter.relevance)
        if (plugin.settings.relevanceThreshold != frontmatter.relevance) targetReliability = frontmatter.relevance;

    return targetReliability;
}

function getOptions(frontmatter: TemplateProperty, richFields: RichField[]) {
    if (frontmatter.key == TAG_FRONMATTER_NAME) {
        return getOptionsForTagFrontmatter(frontmatter)
    }
    return getOptionsForMetadataMenuFrontmatter(frontmatter, richFields);
}

function getOptionsForMetadataMenuFrontmatter(frontmatter: TemplateProperty, richFields: RichField[]) {
    const richField = richFields.find(x => x.name == frontmatter.key);
    if (!richField) throw new Error(); //TODO:

    if (frontmatter.optionsMode == "blacklist") {
        const blacklist = frontmatter.blacklist || [];
        const options = richField.options;

        const correctOptions = options.filter(option => !blacklist.includes(asOptionItem(option)));
        return ToOptions(correctOptions);
    }
    else if (frontmatter.optionsMode == "whitelist") {
        const whitelist = frontmatter.whitelist || []

        return whitelist;
    }
    else if (frontmatter.optionsMode == "all") {
        return ToOptions(richField.options);
    }
    throw new UnreachableCodeError();
}


function getOptionsForTagFrontmatter(frontmatter: TemplateProperty): OptionItem[] {
    if (frontmatter.optionsMode == "blacklist") {

        const blacklist = frontmatter.blacklist || [];
        const tags = getAllTags();

        const correctTags = tags.filter(tag => !blacklist.includes(asOptionItem(tag)));
        return ToOptions(correctTags);
    }
    else if (frontmatter.optionsMode == "whitelist") {
        const whitelist = frontmatter.whitelist || []
        return whitelist;
    }
    else if (frontmatter.optionsMode == "all") {
        return ToOptions(getAllTags());
    }

    throw new UnreachableCodeError();
}

function getSelectedProvider(
): ProviderConfig | undefined {
    const plugin = getPluginInstance();

    const provider = plugin.settings.providers.find(
        (p) => p.name === plugin.settings.selectedProvider
    );
    if (!provider) {
        return undefined;
    }

    const missing: string[] = [];

    if (!provider.selectedModel) {
        missing.push("Please select a model.");
    }
    if (!provider.apiKey?.trim()) {
        missing.push("Please enter the API key.");
    }
    if (!provider.baseUrl?.trim()) {
        missing.push("Please enter the Base URL.");
    }

    if (missing.length > 0) {
        showConfigurationNotice(provider.name, missing);
        return undefined;
    }

    return provider;
}

function showConfigurationNotice(providerName: string, issues: string[]) {
    const header = `Provider "${providerName}" is selected but not fully configured:`;
    const message = issues.map((item) => `• ${item}`).join("\n");
    new Notice(`${header}\n${message}`);
}
