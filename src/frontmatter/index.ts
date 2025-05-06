import { getFrontMatterInfo, TFile, MetadataCache, getAllTags } from "obsidian";
import type { FrontmatterTemplate } from "Providers/ProvidersSetup/shared/Types";
import { DEFAULT_FRONTMATTER_SETTING } from "settings/DefaultSettings";
import { generateId } from "utils";
import type { LinkType, ProcessFrontMatterFn, InsertFrontMatterParams, FrontMatter } from "utils/interface";


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
			fileTags.forEach((tag) => tags.add(tag.replace('#', '')));
		}

		return tags;
	}, new Set<string>());
	return [...allTags];
};

// Moved from BaseSettingsComponent
export const getFrontmatterSetting = (
	id: number,
	settings: FrontmatterTemplate[]
): FrontmatterTemplate => {
	const setting = settings?.find((f) => f.id === id);
	if (!setting) {
		throw new Error('Setting not found');
	}
	return setting;
};

export const addFrontmatterSetting = (
	linkType: LinkType = 'Normal'
): FrontmatterTemplate => {
	return {
		...DEFAULT_FRONTMATTER_SETTING,
		id: generateId(),
		linkType,
	};
};

export const insertToFrontMatter = async (
	processFrontMatter: ProcessFrontMatterFn,
	params: InsertFrontMatterParams
): Promise<void> => {
	await processFrontMatter(params.file, (frontmatter: FrontMatter) => {
		// Ensure values are in raw format for processing (API context)
		const rawValues = formatValuesByLinkType(params.value, params.linkType);

		const existingRawValues = frontmatter[params.key] || [];
		// Combine values based on overwrite setting
		let combinedRawValues = params.overwrite ? rawValues : [...existingRawValues, ...rawValues];

		// Remove duplicates and empty strings
		combinedRawValues = [...new Set(combinedRawValues)].filter(Boolean);

		// Format back for storage context
		frontmatter[params.key] = combinedRawValues;
	});
};

export function formatValuesByLinkType(values: string[], linkType: LinkType = 'Normal'): string[] {
    return linkType === 'WikiLink' 
        ? values.map(item => `[[${item}]]`) 
        : values;
}

export function isTagsFrontmatterTemplate(frontmatterTemplate: FrontmatterTemplate){
	return frontmatterTemplate.name === TAG_FRONMATTER_NAME;
}