import { StructuredOutputSchema, type ProviderConfig, type StructuredOutput } from "Providers/ProvidersSetup/shared/Types";
import { BaseAPIProvider } from "./BaseAPIProvider";
import { ApiError } from "error/ApiError";
import { type RequestUrlParam, requestUrl } from "obsidian";
import { OPENAI_STRUCTURE_OUTPUT } from "Providers/ProvidersSetup/OpenAIProvider";
import { getHeaders, getRequestParam } from ".";

export class OpenAI extends BaseAPIProvider {
	async callAPI(
		system_role: string,
		user_prompt: string,
		provider: ProviderConfig,
		selectedModel: string,
		temperature?: number
	): Promise<StructuredOutput> {
		const headers: Record<string, string> = getHeaders(provider.apiKey);

		// Create messages array for the OpenAI API
		const messages = [
			{ role: 'system', content: system_role },
			{ role: 'user', content: user_prompt },
		];

		// Create the request data
		const data = {
			model: selectedModel,
			messages: messages,
			temperature: temperature || provider.temperature,
			response_format: OPENAI_STRUCTURE_OUTPUT,
		};

		const response = await this.makeApiRequest(provider, headers, data);
		return this.processApiResponse(response);
	}

	private async makeApiRequest(
		provider: ProviderConfig,
		headers: Record<string, string>,
		data: object
	): Promise<any> {
		const url = `${provider.baseUrl}${provider.endpoint}`;
		const requestParam: RequestUrlParam = getRequestParam(url, headers, JSON.stringify(data));

		try {
			const response = await requestUrl(requestParam);
			if (response.status !== 200) {
				console.error('API Error Response:', response.text);
				throw new ApiError(`API request failed with status ${response.status}: ${response.text}`);
			}
			return response.json;
		} catch (error) {
			console.error('API Request Error:', error);
			throw error;
		}
	}
}
