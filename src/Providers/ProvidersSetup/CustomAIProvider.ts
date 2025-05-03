import { AIProvider } from ".";
import { ProviderConfig } from "./shared/Types";

export const CUSTOM_PROVIDER: ProviderConfig = {
    name: AIProvider.Custom,
    apiKey: '',
    baseUrl: '',
    endpoint: '/v1/chat/completions',
    models: [
        {
            name: '',
        },
    ],
    lastTested: null,
    testResult: null,
    selectedModel: '',
};
export const LMSTUDIO_STRUCTURE_OUTPUT = {
	type: 'json_schema',
	json_schema: {
		name: 'structured_output',
		strict: true,
		schema: {
			type: 'object',
			properties: {
				output: {
					type: 'array',
					items: { type: 'string' },
				},
				reliability: {
					type: 'number',
				},
			},
			required: ['output', 'reliability'],
		},
	},
};

