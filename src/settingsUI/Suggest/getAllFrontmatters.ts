import type { ValidatedFieldInfo } from "MetadataMenuOptionsResolver/types/metadataMenuSchemas";

export function getAllFrontmattersName(metadataProperties :Array<ValidatedFieldInfo>) {
    const names = metadataProperties.map((filed) => filed.name);
				names.push('tags')
    return names;
}