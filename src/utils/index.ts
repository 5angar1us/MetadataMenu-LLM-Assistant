import { CUSTOM_PROVIDER } from "Providers/ProvidersSetup/CustomAIProvider";
import { AIProvider } from "Providers/ProvidersSetup";
import { OPENAI_PROVIDER } from "Providers/ProvidersSetup/OpenAIProvider";
import { ProviderConfig } from "Providers/ProvidersSetup/shared/Types";


export const generateId = (): number => {
	return Date.now();
};

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


