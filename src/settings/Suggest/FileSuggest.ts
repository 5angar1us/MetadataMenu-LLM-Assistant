import { AbstractInputSuggest, App } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<string> {
    private Files: string[];

    constructor(private inputEl: HTMLInputElement, app: App) {
        super(app, inputEl);
        
        this.Files = this.app.vault.getFiles().map(file => file.path);
        
    }

    getSuggestions(inputStr: string): string[] {
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