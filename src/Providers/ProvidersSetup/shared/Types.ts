import { type LinkType } from "utils/interface";
import { z } from 'zod';

export interface ProviderConfig {
	name: string;
	apiKey: string;
	baseUrl: string;
	endpoint: string;
	models: Model[];
	lastTested: Date | null;
	testResult: boolean | null;
	temperature?: number;
	selectedModel?: string;
}

interface Model {
	name: string;
}

export interface FrontmatterTemplate { // to -> TemplateProperty
	id: number;
	name: string;
	count: number;
	refs: string[];
	overwrite: boolean;
	linkType: LinkType;
}

export interface TemplateProperty {
	id: number;                   // uuid
	key: string;                  // frontmatter key
	overwrite: boolean;
	count?: number;               // >=0, если множественный тип
	relevance: number;            // 0…1
	failureAction: FailureAction;
	optionsMode: OptionsMode;
	options: string[];            // список значений из textarea
	optionsDescription?: string;  // free text
}

export interface FormatTemplate {
	id: number;                 // uuid
	name: string;
	sourceNotePath: string;     // «Источник свойств»
	controlFieldValue: string;  // «Значение управляющего поля» (readonly)
	frontmatters: TemplateProperty[];
}

export type OptionsMode = 'all' | 'whitelist' | 'blacklist';

export type FailureActionType =
  | 'default-value'
  | 'add-tag'
  | 'set-other-property'
  | 'move-to-folder';


export interface FailureActionBase {
	type: FailureActionType;
}

export interface FailureActionDefaultValue extends FailureActionBase {
	type: 'default-value';
	value: string;          // suggest-input
}
export interface FailureActionAddTag extends FailureActionBase {
	type: 'add-tag';
	tag: string;            // suggest-input
}
export interface FailureActionSetOtherProperty extends FailureActionBase {
	type: 'set-other-property';
	targetKey: string;      // suggest-input
	targetValue: string;    // suggest-input, зависит от targetKey
}
export interface FailureActionMoveToFolder extends FailureActionBase {
	type: 'move-to-folder';
	folder: string;         // suggest-input => SearchComponent
}

export type FailureAction =
	| FailureActionDefaultValue
	| FailureActionAddTag
	| FailureActionSetOtherProperty
	| FailureActionMoveToFolder;

// Тип для использования в TypeScript
export type StructuredOutput = z.infer<typeof StructuredOutputSchema>;


export const StructuredOutputSchema = z.object({
	output: z.array(z.string()),
	reliability: z.number()
		.min(0)
		.max(1),
});


export interface APIProvider {
	callAPI(
		system_role: string,
		user_prompt: string,
		provider: ProviderConfig,
		selectedModel: string,
		temperature?: number
	): Promise<StructuredOutput>;

	verifyConnection(provider: ProviderConfig): Promise<boolean>;
}
