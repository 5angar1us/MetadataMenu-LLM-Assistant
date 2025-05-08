import { type LinkType } from "utils/interface";
import { z } from 'zod';

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


// Тип для использования в TypeScript
export type StructuredOutput = z.infer<typeof StructuredOutputSchema>;


export const StructuredOutputSchema = z.object({
	output: z.array(z.string()), 
	reliability: z.number()      
	  .min(0)                   
	  .max(1),                  
  });


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
