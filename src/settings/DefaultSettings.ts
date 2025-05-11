import { generateId, TAG_FRONMATTER_NAME } from 'frontmatter';
import { AIProvider } from 'Providers/ProvidersSetup';
import { CUSTOM_PROVIDER } from 'Providers/ProvidersSetup/CustomAIProvider';
import { OPENAI_CUSTOM_PROVIDER } from 'Providers/ProvidersSetup/OpenAICompotabilityProvider';
import { OPENAI_PROVIDER, OpenAIModelName } from 'Providers/ProvidersSetup/OpenAIProvider';
import { OPENROUTER_PROVIDER } from 'Providers/ProvidersSetup/OpenRouterProvider';
import type {
	TemplateProperty,
	FailureActionDefaultValue,
	OptionsMode,
} from 'Providers/ProvidersSetup/shared/Types';
import type { AutoClassifierSettings } from 'settings';

const DEFAULT_FAILURE_ACTION: FailureActionDefaultValue = {
	type: 'default-value',
	value: '',
};

// Note: 'id' and 'key' will be set when a new frontmatter is created.
// This serves as a template for other properties.
export const DEFAULT_FRONTMATTER_PROPERTY_SETTINGS: TemplateProperty = {
	id: generateId(),
	key: '',
	count: 1,
	overwrite: false,
	relevance: 0.75, // Default relevance threshold for a new property
	failureAction: { ...DEFAULT_FAILURE_ACTION },
	optionsMode: 'all' as OptionsMode,
	options: [],
	optionsDescription: '',
};

export const DEFAULT_TAG_SETTING: TemplateProperty = {
	id: 0, // Special ID for the default tag setting
	key: TAG_FRONMATTER_NAME,
	count: 5,
	overwrite: false,
	relevance: 0.75, // Default relevance for tags
	failureAction: { ...DEFAULT_FAILURE_ACTION }, // Default failure action for tags
	optionsMode: 'all' as OptionsMode,
	options: [],
	optionsDescription: '',
	// linkType: 'Normal', // from old FrontmatterTemplate, check if needed
};

// Default settings for the Auto Classifier plugin
export const DEFAULT_SETTINGS: AutoClassifierSettings = {
	providers: [OPENAI_PROVIDER, CUSTOM_PROVIDER, OPENROUTER_PROVIDER, OPENAI_CUSTOM_PROVIDER],
	selectedProvider: AIProvider.OpenAI,
	selectedModel: OpenAIModelName.GPT_4_1_MINI,
	frontmatter: [DEFAULT_TAG_SETTING], // This should be TemplateProperty[]
	formatTemplates: [],
	relevanceThreshold: 0.75, // Global default relevance threshold
};

