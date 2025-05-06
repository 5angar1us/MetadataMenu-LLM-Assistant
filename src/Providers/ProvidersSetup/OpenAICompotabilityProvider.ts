import { AIProvider } from ".";
import type { ProviderConfig } from "./shared/Types";


export const OPENAI_CUSTOM_PROVIDER: ProviderConfig = {
    name: AIProvider.OpenAICustom,
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
}