import { GetMetadataMenuApi } from "PluginAvailability";
import { ValidatedFieldInfoSchema, type ValidatedFieldInfo } from "./metadataMenuSchemas";
import { isSupportedFiled } from "./metadataMenusGetOptions";
import { getOptionsString as getOptions } from 'types/metadataMenusGetOptions';
import { getPluginInstance } from "utils/pluginInstance";
import type { FieldType } from "metadatamenu";

export interface RawField {
    name: string;
    type: FieldType;
    options: Record<string, any>;
}

export interface RichField {
    name: string;
    type: FieldType;
    options: string[];
}


export async function getRawSupportedFields(filePath: string) {

    const plugin = getPluginInstance();
    const mmapi = GetMetadataMenuApi(plugin.app);
    let currentOutputText = '';
    let newSourceInfo: Array<ValidatedFieldInfo> = [];

    if (!mmapi) {
        currentOutputText = 'Metadata Menu API not available.';
        if (plugin.settings.isDebug) console.warn(currentOutputText);
        throw new Error(currentOutputText);
    }
    if (!filePath) {
        currentOutputText = 'No file selected to analyze.';
        throw new Error(currentOutputText);
    }

    const tFile = plugin.app.vault.getAbstractFileByPath(filePath);

    if (!tFile) {
        currentOutputText = `File not found: ${filePath}`;
        if (plugin.settings.isDebug) console.warn(currentOutputText);
        throw new Error(currentOutputText);
    }

    try {
        const rawFields = await mmapi.fileFields(filePath);
        const validatedFields: Array<ValidatedFieldInfo> = [];
        const fieldsForDebug: RawField[] = [];

        for (const field of Object.values(rawFields)) {
            if (isSupportedFiled(field)) {
                const fieldDataToParse = {
                    name: field.name,
                    type: field.type, // This should align with FieldTypeSchema in metadataMenuSchemas.ts
                    options: field.options || {}, // Ensure options is an object
                };
                fieldsForDebug.push(fieldDataToParse);

                const parseResult = ValidatedFieldInfoSchema.safeParse(fieldDataToParse);
                if (parseResult.success) {
                    validatedFields.push(parseResult.data);
                } else {
                    if (plugin.settings.isDebug) {
                        console.warn(
                            `Validation failed for field '${field.name}' (type: ${field.type}):`,
                            parseResult.error.flatten()
                        );
                    }
                }
            }
        }
        newSourceInfo = validatedFields;
        currentOutputText = JSON.stringify(fieldsForDebug, null, 2);
    } catch (error) {
        if (plugin.settings.isDebug) console.error(`Error processing file '${filePath}':`, error);
        throw error;
    }

    return newSourceInfo;
}

export async function getSupportedFieldsWitOptionsFromRaw(
    sourceFileFieldInfo: Array<ValidatedFieldInfo>
){
    const fieldsForDebug: RichField[] = [];

    for (const field of sourceFileFieldInfo) {
        if (isSupportedFiled(field)) {
            const options = await getOptions(field);
            const fieldDataToParse: RichField = {
                name: field.name,
                type: field.type,
                options: options || [] as string[],
            };
            fieldsForDebug.push(fieldDataToParse);
        }
    }
    return fieldsForDebug;
    
}