import { TFile } from 'obsidian';

export interface FrontMatter {
	[key: string]: string[];
}
export type ProcessFrontMatterFn = (
	file: TFile,
	fn: (frontmatter: FrontMatter) => void
) => Promise<void>;

export type LinkType = 'Normal' | 'WikiLink';

export interface InsertFrontMatterParams {
    file: TFile;
    key: string;
    value: string[];
    overwrite: boolean;
    linkType?: LinkType;
}


