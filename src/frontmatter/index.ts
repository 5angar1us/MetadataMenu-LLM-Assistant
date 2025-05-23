import { getFrontMatterInfo, TFile, MetadataCache, getAllTags } from "obsidian";
import type { FormatTemplate, TemplateProperty } from "settings";
import type { LinkType, ProcessFrontMatterFn, InsertFrontMatterParams, FrontMatter } from "utils/interface";
import { getPluginInstance } from "utils/pluginInstance";

export const generateId = (): number => {
	return Date.now();
};

export const TAG_FRONMATTER_NAME = 'tags';

/**
 * Extracts the content of a markdown file excluding frontmatter
 * @param content - The full content of the markdown file
 * @returns The content without frontmatter
 */
export const getContentWithoutFrontmatter = (content: string): string => {
	const { contentStart } = getFrontMatterInfo(content);
	return content.slice(contentStart);
};

// Get all tags from the vault
export const getTags = async (
	files: ReadonlyArray<TFile>,
	metadataCache: MetadataCache
): Promise<string[]> => {
	const allTags = files.reduce((tags, file) => {
		const cache = metadataCache.getFileCache(file);
		if (!cache) return tags;

		const fileTags: string[] | null = getAllTags(cache);

		if (fileTags && fileTags.length > 0) {
			fileTags.forEach((tag) => tags.add(tag));
		}

		return tags;
	}, new Set<string>());
	return [...allTags];
};

export function getFrontmatter(currentFile: TFile, frontmatterName: string) {
	const plugin = getPluginInstance();
	const cache = plugin.app.metadataCache.getFileCache(currentFile);
	if (!cache) return undefined
	const frontmatters = cache.frontmatter;
	if (!frontmatters) return undefined

	return frontmatters[frontmatterName];
}


export const addFrontmatterSetting = (
): TemplateProperty => {
	return {
		id: generateId(),
		key: '',
		overwrite: false,
		MaxCount: undefined,
		relevance: 0.75,
		failureAction: {
			type: "default-value",
			value: ""
		},
		optionsMode: "all",
		options: [],
		optionsDescription: undefined,
	};
};



export const insertToFrontMatter = async (
	file: TFile,
	key: string,
	value: string[],
	overwrite: boolean,
): Promise<void> => {
	const plugin = getPluginInstance();

	const processFrontMatter = (file: TFile, fn: (frontmatter: FrontMatter) => void) =>
		plugin.app.fileManager.processFrontMatter(file, fn);

	await processFrontMatter(file, (frontmatter: FrontMatter) => {
		// Ensure values are in raw format for processing (API context)
		const rawValues = value;

		const existingRawValues = frontmatter[key] || [];
		// Combine values based on overwrite setting
		let combinedRawValues = overwrite ? rawValues : [...existingRawValues, ...rawValues];

		// Remove duplicates and empty strings
		combinedRawValues = [...new Set(combinedRawValues)].filter(Boolean);

		// Format back for storage context
		frontmatter[key] = combinedRawValues;
	});
};

export function formatValuesByLinkType(values: string[], linkType: LinkType = 'Normal'): string[] {
	return linkType === 'WikiLink'
		? values.map(item => `[[${item}]]`)
		: values;
}

export function isTagsFrontmatterTemplate(frontmatterTemplate: TemplateProperty) {
	return frontmatterTemplate.key === TAG_FRONMATTER_NAME;
}