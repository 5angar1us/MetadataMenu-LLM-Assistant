import { AbstractInputSuggest, App } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<string> {
    private Files: string[];

    constructor(private inputEl: HTMLInputElement, app: App) {
        super(app, inputEl);
        
        this.Files = this.app.vault.getFiles()
            .filter(file=> file.extension.contains("md"))
            .map(file => file.path);
        
    }

    getSuggestions(inputStr: string): string[] {
        // Without this, it doesn't work well with modal windows. The first element there gets focused immediately after opening. 
        // If this element has the suggest feature, it will immediately show the suggest. This looks extremely unappealing.
        if (!inputStr) return [];

        const inputLower = inputStr.toLowerCase();
        return this.Files.filter(folder => 
            folder.toLowerCase().includes(inputLower)
        );
    }

    renderSuggestion(folder: string, el: HTMLElement): void {
        el.createEl("div", { text: folder });
    }

    selectSuggestion(folder: string): void {
        this.inputEl.value = folder;
        const event = new Event('input');
        this.inputEl.dispatchEvent(event);
        this.inputEl.focus();
        this.close();
    }
}