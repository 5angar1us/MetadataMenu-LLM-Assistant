

import { getHeaders, getRequestParam } from '.';

import { type RequestUrlParam, requestUrl } from 'obsidian';

import { BaseAPIProvider } from './BaseAPIProvider';
import type { ProviderConfig, StructuredOutput } from 'LLMProviders/ProvidersSetup/shared/Types';
import { OPENROUTER_STRUCTURE_OUTPUT } from 'LLMProviders/ProvidersSetup/OpenRouterProvider';
import { ApiError } from 'LLMProviders/error/ApiError';


export class OpenRouter extends BaseAPIProvider {
	async callAPI(
		system_role: string,
		user_prompt: string,
		provider: ProviderConfig,
		selectedModel: string,
		temperature?: number
	): Promise<StructuredOutput> {
		const headers: Record<string, string> = {
			...getHeaders(provider.apiKey),
			'X-Title': 'Metadata Auto Classifier',
		};

		// Create messages array for the API
		const messages = [
			{ role: 'system', content: system_role },
			{ role: 'user', content: user_prompt },
		];

		// Create the request data with structured output format
		const data = {
			model: selectedModel,
			messages: messages,
			temperature: temperature || provider.temperature,
			response_format: OPENROUTER_STRUCTURE_OUTPUT,
		};

		const response = await this.makeApiRequest(provider, headers, data);
		console.log('OpenRouter API Response:', JSON.stringify(response, null, 2));
		return this.processApiResponse(response);
	}

	private async makeApiRequest(
		provider: ProviderConfig,
		headers: Record<string, string>,
		data: object
	): Promise<any> {
		const url = `${provider.baseUrl}${provider.endpoint}`;
		const requestParam: RequestUrlParam = getRequestParam(url, headers, JSON.stringify(data));
		console.log('OpenRouter API Request:', JSON.stringify(data, null, 2));

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
