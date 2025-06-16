import { App, FuzzySuggestModal, TFile, type FuzzyMatch } from 'obsidian';

/**
 * Modal for searching and selecting wiki links from existing files in the vault
 */
export class WikiLinkSuggestModal extends FuzzySuggestModal<TFile> {
	private onItemSelected: (file: TFile) => void;

	constructor(app: App, onItemSelected: (file: TFile) => void) {
		super(app);
		this.onItemSelected = onItemSelected;
	}

	getItems(): TFile[] {
		return this.app.vault.getMarkdownFiles();
	}

	getItemText(file: TFile): string {
		return file.basename;
	}

	renderSuggestion(file: FuzzyMatch<TFile>, el: HTMLElement): void {
		el.createEl('div', { text: file.item.basename });
		el.createEl('small', { text: file.item.path });
	}

	onChooseItem(file: TFile): void {
		this.onItemSelected(file);
	}
}

