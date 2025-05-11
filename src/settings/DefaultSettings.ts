import { TAG_FRONMATTER_NAME } from 'frontmatter';
import { AIProvider } from 'Providers/ProvidersSetup';
import { CUSTOM_PROVIDER } from 'Providers/ProvidersSetup/CustomAIProvider';
import { OPENAI_CUSTOM_PROVIDER } from 'Providers/ProvidersSetup/OpenAICompotabilityProvider';
import { OPENAI_PROVIDER, OpenAIModelName } from 'Providers/ProvidersSetup/OpenAIProvider';
import { OPENROUTER_PROVIDER } from 'Providers/ProvidersSetup/OpenRouterProvider';
import type { FrontmatterTemplate } from 'Providers/ProvidersSetup/shared/Types';
import type { AutoClassifierSettings } from 'settings';

export const DEFAULT_FRONTMATTER_SETTING = {
	name: '',
	count: 1,
	refs: [],
	overwrite: false,
	linkType: 'Normal' as const,
};
export const DEFAULT_TAG_SETTING: FrontmatterTemplate = {
	id: 0,
	name: TAG_FRONMATTER_NAME,
	refs: [],
	count: 5,
	overwrite: false,
	linkType: 'Normal',
};
// Default settings for the Auto Classifier plugin

export const DEFAULT_SETTINGS: AutoClassifierSettings = {
	providers: [OPENAI_PROVIDER, CUSTOM_PROVIDER, OPENROUTER_PROVIDER, OPENAI_CUSTOM_PROVIDER],
	selectedProvider: AIProvider.OpenAI,
	selectedModel: OpenAIModelName.GPT_4_1_MINI,
	frontmatter: [DEFAULT_TAG_SETTING],
	formatTemplates : [],
	relevanceThreshold: 0.75
}; // Default tag settings

