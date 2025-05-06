import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { ApiError } from 'error/ApiError';
import { BaseAPIProvider } from './BaseAPIProvider';
import type { ProviderConfig, StructuredOutput } from 'Providers/ProvidersSetup/shared/Types';


// Define the Zod schema for the expected output structure
const structuredOutputSchema = z.object({
	output: z.array(z.string()),
	reliability: z.number().min(0).max(100), // Assuming reliability is a percentage
});

export class OpenAICustom extends BaseAPIProvider {
	async callAPI(
		system_role: string,
		user_prompt: string,
		provider: ProviderConfig,
		selectedModel: string,
		temperature?: number
	): Promise<StructuredOutput> {
		const openai = createOpenAI({
			baseURL: provider.baseUrl,
			apiKey: provider.apiKey,
		});

		try {
			const model = openai(selectedModel);

			const response = await generateObject({
				model: model,
				schema: structuredOutputSchema,
				system: system_role,
				prompt: user_prompt,
				temperature: temperature ?? provider.temperature,
			});

			// TODO: Log token usage if needed: response.usage.totalTokens
			// console.log("Token usage:", response.usage);

			return response.object;
		} catch (error) {
			console.error('OpenAI Custom API Error:', error);

			if (error instanceof ApiError) {
				throw error;
			}

			throw new ApiError(`API request failed: ${error.message}`);
		}
	}

}