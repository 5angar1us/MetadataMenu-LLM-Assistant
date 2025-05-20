import type { App } from "obsidian";

export function getAllTags(app: App):string[]{
    // this is an undocumented function...
    // https://github.com/Fevol/obsidian-typings/blob/14d1b3f7fc0f6d167a9721a0f60a14ba4815fee8/src/obsidian/augmentations/MetadataCache.d.ts#L338
    // @ts-ignore
    const tagMap = app.metadataCache.getTags() as Record<string, number>;
    return Object.keys(tagMap).map((k) => k.replace("#", ""));
}