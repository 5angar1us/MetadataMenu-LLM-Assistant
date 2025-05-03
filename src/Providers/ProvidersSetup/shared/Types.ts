import { LinkType } from "utils/interface";

export interface ProviderConfig {
    name: string;
    apiKey: string;
    baseUrl: string;
    endpoint: string;
    models: Model[];
    lastTested: Date | null;
    testResult: boolean | null;
    temperature?: number;
    selectedModel?: string;
}

interface Model {
	name: string;
}

export interface FrontmatterTemplate {
	id: number;
	name: string;
	count: number;
	refs: string[];
	overwrite: boolean;
	linkType: LinkType;
}

export interface StructuredOutput {
	output: string[];
	reliability: number;
}


export interface APIProvider {
	callAPI(
		system_role: string,
		user_prompt: string,
		provider: ProviderConfig,
		selectedModel: string,
		temperature?: number
	): Promise<StructuredOutput>;

	verifyConnection(provider: ProviderConfig): Promise<boolean>;
}
