import { DEFAULT_TEMPERATURE } from "Providers/Const";
import { AIProvider } from ".";
import type { ProviderConfig } from "./shared/Types";

export const OPENROUTER_PROVIDER: ProviderConfig = {
    name: AIProvider.OpenRouter,
    apiKey: '',
    baseUrl: 'https://openrouter.ai',
    endpoint: '/api/v1/chat/completions',
    models: [
        {
            name: 'google/gemini-2.0-flash-exp:free',
        },
        {
            name: 'meta-llama/llama-3.3-70b-instruct',
        },
        {
            name: 'deepseek/deepseek-r1',
        },
    ],
    lastTested: null,
    testResult: null,
    temperature: DEFAULT_TEMPERATURE,
    selectedModel: 'openrouter/auto',
};

export const OPENROUTER_STRUCTURE_OUTPUT = {
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
