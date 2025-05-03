
import { APIProvider, ProviderConfig, StructuredOutput } from "Providers/ProvidersSetup/shared/Types";
import { tryCatch } from "utils/ErrorHandling";

export abstract class BaseAPIProvider implements APIProvider {
    abstract  callAPI(
        system_role: string, 
        user_prompt: string, 
        provider: ProviderConfig, 
        selectedModel: string, 
        temperature?: number): Promise<StructuredOutput>;

    async verifyConnection(provider: ProviderConfig): Promise<boolean> {
		const result = await tryCatch(
			this.callAPI(
				'You are a test system. You must respond with valid JSON.',
				`Return a JSON object containing {"output": [], "reliability": 0}`,
				provider,
				provider.models[0]?.name
			)
		);
	
		if (result.error) {
			console.log('OpenRouter verifyConnection error:', result.error);
			return false;
		}
	
		console.log('OpenRouter verifyConnection result:', result.data);
		return true;
	}
}

