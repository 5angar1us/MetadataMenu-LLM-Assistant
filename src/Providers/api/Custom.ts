import { ApiError } from "error/ApiError";
import { type RequestUrlParam, requestUrl } from "obsidian";
import { LMSTUDIO_STRUCTURE_OUTPUT } from "Providers/ProvidersSetup/CustomAIProvider";
import type { ProviderConfig, StructuredOutput } from "Providers/ProvidersSetup/shared/Types";
import { getHeaders, getRequestParam } from ".";
import { BaseAPIProvider } from "./BaseAPIProvider";


export class Custom extends BaseAPIProvider {
	async callAPI(
		system_role: string,
		user_prompt: string,
		provider: ProviderConfig,
		selectedModel: string,
		temperature?: number
	): Promise<StructuredOutput> {
		const headers: Record<string, string> = getHeaders(provider.apiKey);

		// Create messages array for the API
		const messages = [
			{ role: 'system', content: system_role },
			{ role: 'user', content: user_prompt },
		];

		// Create the request data
		const data = {
			model: selectedModel,
			messages: messages,
			temperature: temperature || provider.temperature,
			response_format: LMSTUDIO_STRUCTURE_OUTPUT,
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
		console.log('Custom API Request:', JSON.stringify(data, null, 2));

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

	private processApiResponse(responseData: any): StructuredOutput {
		// Handle different response formats from various models
		const messageContent = responseData.choices[0].message.content;

		// Some models might return parsed JSON directly
		if (typeof messageContent === 'object' && messageContent !== null) {
			return messageContent as StructuredOutput;
		}

		// Otherwise parse the content as JSON
		const content = messageContent.trim();
		return JSON.parse(content) as StructuredOutput;
	}
}
