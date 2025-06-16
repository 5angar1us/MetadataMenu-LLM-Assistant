
import { ApiError } from "LLMProviders/error/ApiError";
import { StructuredOutputSchema, type APIProvider, type ProviderConfig, type StructuredOutput } from "LLMProviders/ProvidersSetup/shared/Types";
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

	protected processApiResponse(responseData: any): StructuredOutput {
        try {

            if (!responseData.choices || responseData.choices.length === 0) {
                throw new ApiError('No choices in API response');
            }

            const message = responseData.choices[0].message;
            if (!message || !message.content) {
                throw new ApiError('No message content in API response');
            }

            if (typeof message.content === 'object' && message.content !== null) {
                return StructuredOutputSchema.parse(message.content);
            }

            if (typeof message.content === 'string') {
                const content = message.content.trim();
                return StructuredOutputSchema.parse(JSON.parse(content));
            }

            throw new ApiError('Unsupported response format');
        } catch (error) {
            console.error('Error processing API response:', error);
            throw error instanceof ApiError ? error : new ApiError('Failed to process API response');
        }
    }
}

