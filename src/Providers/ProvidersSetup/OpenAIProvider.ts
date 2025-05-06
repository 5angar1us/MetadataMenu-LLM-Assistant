import { DEFAULT_TEMPERATURE } from "Providers/Const";
import { AIProvider } from ".";
import type { ProviderConfig } from "./shared/Types";

export enum OpenAIModelName {
    GPT_4_1 = 'gpt-4.1',
    GPT_4_1_MINI = 'gpt-4.1-mini',
    GPT_4_1_NANO = 'gpt-4.1-nano',
    GPT_4O = 'gpt-4o',
}
// Default OpenAI provider configuration
export const OPENAI_PROVIDER: ProviderConfig = {
    name: AIProvider.OpenAI,
    apiKey: '',
    baseUrl: 'https://api.openai.com',
    endpoint: '/v1/chat/completions',
    models: [
        { name: OpenAIModelName.GPT_4_1 },
        { name: OpenAIModelName.GPT_4_1_MINI },
        { name: OpenAIModelName.GPT_4_1_NANO },
        { name: OpenAIModelName.GPT_4O },
    ],
    lastTested: null,
    testResult: null,
    temperature: DEFAULT_TEMPERATURE,
    selectedModel: OpenAIModelName.GPT_4_1_MINI,
};
export const OPENAI_STRUCTURE_OUTPUT = {
	type: 'json_schema',
	json_schema: {
		name: 'metadata_classifier',
		schema: {
			type: 'object',
			properties: {
				output: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of classified tags or categories',
				},
				reliability: {
					type: 'number',
					description: 'A number between 0 and 1 indicating confidence in the classification',
				},
			},
			required: ['output', 'reliability'],
			additionalProperties: false,
		},
		strict: true,
	},
};
