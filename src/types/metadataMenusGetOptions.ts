import { getAPI, type DataviewApi } from "obsidian-dataview";
import type { ValidatedFieldInfo } from "./metadataMenuSchemas";
import { getPluginInstance } from "utils/pluginInstance";
import { convertDvjsToDvQuery } from "utils/DataviewQueryConverter";

type ValidatedFieldInfoType = ValidatedFieldInfo['type'];
const SUPPORTED_TYPES = [ "Select", "Multi"] as const;

const SUPPORTED_SOURCETYPE = [ "ValuesList", "ValuesListNotePath"] as const;

type SupportedTypes = typeof SUPPORTED_TYPES[number]; 
type SupportedSourceTypes = typeof SUPPORTED_SOURCETYPE[number]; 


export function isSupportedFiled(field: ValidatedFieldInfo): boolean{

  const type = field.type;
  if (!isSupportedType(type)) return false;

  const options = field.options;
  const sourceType = field.options.sourceType as string;
  if(!isSupportedSourceType(sourceType)) return false

  return true;
}

function isSupportedType(value: string): value is SupportedTypes {
  return SUPPORTED_TYPES.includes(value as SupportedTypes);
}

function isSupportedSourceType(value: string): value is SupportedSourceTypes {
  return SUPPORTED_SOURCETYPE.includes(value as SupportedSourceTypes);
}


export async function getOptionsString(fieldInfo: ValidatedFieldInfo): Promise<string[] | undefined> {
  const { type, options } = fieldInfo;
  let result: string[] | undefined;
  switch (type) {
    case 'Select':
    case 'Cycle':
    case 'Multi':
      result = await handleSelectLikeOptions(options);
      break;

    case 'Number':
      result = handleNumberOptions(options);
      break;
    case 'File':
    case 'MultiFile':
      result = await handleFileOptions(options);
      break;
    // case 'Date':
    // case 'DateTime':
    // case 'Time':
    // case 'Media':
    // case 'MultiMedia'
    default:
      result = undefined;
  }
  if (!result) console.log(`Error in parse option property:${fieldInfo.name} type:${fieldInfo.type} options:`,options)


  return result;
}


async function handleSelectLikeOptions(options: any): Promise<string[] | undefined> {
  if (!options?.sourceType) return undefined;

  switch (options.sourceType) {
    case 'ValuesList':
      return Object.values(options.valuesList || {});

    case 'ValuesFromDVQuery':
      const plugin1 = getPluginInstance();

      const dataviewApi: DataviewApi = getAPI(plugin1.app);

      const dataviewJSQuery = options.valuesFromDVQuery as string;
      if (!dataviewJSQuery) {
        console.log(`dataviewJSQuery for valuesFromDVQuery from options is not extracted in handleSelectLikeOptions`)
        return undefined
      }

      const dataviewQuery = convertDvjsToDvQuery(dataviewJSQuery);
      if (!dataviewQuery) {
        console.log(`Fail with convert from ValuesFromDVQuery in handleSelectLikeOptions`)
        return undefined
      }

      const result = await dataviewApi.tryQuery(dataviewQuery);
      const values = result.values as any[];

      return values as string[];

    case 'ValuesListNotePath':
      try{
         const plugin2 = getPluginInstance();
        const path = options.valuesListNotePath;
        
        const fileContent = await plugin2.app.vault.adapter.read(path)
        const values2 = fileContent.split("\n")
        return values2;
      }
      catch(err){
        //TODO: handler error
        return undefined;
      }

    default:
      return undefined;
  }
}

function handleNumberOptions(options: any): string[] | undefined {
  const allOptionsCorrect =
    typeof options.min === 'number'
    && typeof options.max === 'number'
    && typeof options.step === 'number';

  if (!allOptionsCorrect) return undefined

  const { min, max, step } = options;

  if (step <= 0 || min > max) {
    return undefined;
  }

  const expectedLength = Math.floor((max - min) / step) + 1;
  const parts: string[] = [];
  parts.length = expectedLength;

  for (let i = 0, value = min; i < expectedLength; i++, value += step) {
    parts[i] = value.toString();
  }

  return parts.length > 0 ? parts : undefined;
}

async function handleFileOptions(options: any): Promise<string[] | undefined> {
  const plugin = getPluginInstance();

  const dataviewApi: DataviewApi = getAPI(plugin.app);

  const dataviewJSQuery = options.dvQueryString;
  if (!dataviewJSQuery) {
    console.log(`dataviewJSQuery for dvQueryString from options is not extracted in handleFileOptions`);
    return undefined
  }

  const dataviewQuery = convertDvjsToDvQuery(dataviewJSQuery);
  if (!dataviewQuery) {
    console.log(`Fail with convert from dvQueryString in handleFileOptions`)
    return undefined
  }

  const result = await dataviewApi.tryQuery(dataviewQuery);
  const values = result.values as any[];

  const filePaths = values.map(value => value.path) as string[];

  return filePaths;
}