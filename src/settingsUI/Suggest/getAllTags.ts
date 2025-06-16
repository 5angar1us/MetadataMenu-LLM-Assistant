import type { App } from "obsidian";
import { getPluginInstance } from "utils/pluginInstance";

       

export function getAllTags():string[]{
    const plugin = getPluginInstance();
    // this is an undocumented function...
    // https://github.com/Fevol/obsidian-typings/blob/14d1b3f7fc0f6d167a9721a0f60a14ba4815fee8/src/obsidian/augmentations/MetadataCache.d.ts#L338
    // @ts-ignore
     
    const tagMap = plugin.app.metadataCache.getTags() as Record<string, number>;

    let tags = Object.keys(tagMap);

    //tags = tags.map((k) => k.replace("#", ""))
    
    return tags;
}