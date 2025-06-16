import { AIProvider } from "LLMProviders/ProvidersSetup";
import { CUSTOM_PROVIDER } from "LLMProviders/ProvidersSetup/CustomAIProvider";
import { OPENAI_PROVIDER } from "LLMProviders/ProvidersSetup/OpenAIProvider";


export const getDefaultEndpoint = (providerName: string): string => {
	switch (providerName) {
		case AIProvider.OpenAI:
			return OPENAI_PROVIDER.endpoint;
		case AIProvider.Custom:
			return CUSTOM_PROVIDER.endpoint;
		default:
			return CUSTOM_PROVIDER.endpoint;
	}
};


