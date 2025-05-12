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

// Defines how options are used for validation or suggestion
export type OptionsMode = 'all' | 'whitelist' | 'blacklist';

// Defines the types of actions to take if relevance threshold is not met
export type FailureActionType =
  | 'default-value'
  | 'add-tag'
  | 'set-other-property'
  | 'move-to-folder';

// Base interface for failure actions
export interface FailureActionBase {
	type: FailureActionType;
}

// Action to set a default value from the predefined options
export interface FailureActionDefaultValue extends FailureActionBase {
	type: 'default-value';
	value: string;          // Value selected from 'options' or a custom suggest-input
}


// Action to set another property on the note
export interface FailureActionSetOtherProperty extends FailureActionBase {
	type: 'set-other-property';
	targetKey: string;      // Key of the property to set, suggest-input
	targetValue: string;    // Value to set for the targetKey, suggest-input (context-aware)
}

// Action to move the note to a specified folder
export interface FailureActionMoveToFolder extends FailureActionBase {
	type: 'move-to-folder';
	folder: string;         // Destination folder path, suggest-input (SearchComponent)
}

// Union type for all possible failure actions
export type FailureAction =
	| FailureActionDefaultValue
	| FailureActionSetOtherProperty
	| FailureActionMoveToFolder;

export type OptionItem = string & { __brand: "OptionItem" };

export function ToOptions(values: string[]){
	return values.map(asOptionItem);
}
export function asOptionItem(value: string): OptionItem {
    return value as OptionItem;
}

export interface TemplateProperty {
	id: number;                   // uuid
	key: string;                  // frontmatter key
	overwrite: boolean;
	count?: number;               // >=0, if the type supports multiple values
	relevance?: number;            // 0…1, specific relevance threshold for this property
	failureAction: FailureAction; // Action to take if relevance threshold is not met
	optionsMode: OptionsMode;     // How the 'options' array is to be interpreted
	options?: OptionItem[];            // List of predefined values (e.g., for dropdowns, validation)
	optionsDescription?: string;  // Free text description for the options (e.g., explaining their source or purpose)
}

export interface FormatTemplate {
	id: number;                 // uuid
	name: string;
	sourceNotePath: string;     // «Источник свойств»
	controlFieldValue: string;  // «Значение управляющего поля» (readonly)
	frontmatters: TemplateProperty[];
}

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
