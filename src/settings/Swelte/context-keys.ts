import AutoClassifierPlugin from "main";
import { writable } from "svelte/store";
import type { ValidatedFieldInfo } from "types/metadataMenuSchemas";

export let AutoClassifierPluginKey = Symbol('Plugin');

export let MetadataPropertyKeys = Symbol('MetadataPropertyKeys');

export const globasourceFileFieldInfo = writable<Array<ValidatedFieldInfo> | undefined>();