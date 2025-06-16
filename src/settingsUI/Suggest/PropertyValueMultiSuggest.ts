import { App, AbstractInputSuggest, prepareFuzzySearch, type SearchResult } from "obsidian";
import { getOptionsString } from "MetadataMenuOptionsResolver/GetOptions";
import type { ValidatedFieldInfo } from "MetadataMenuOptionsResolver/types/metadataMenuSchemas";

export class PropertyValueMultiSuggest extends AbstractInputSuggest<string> {
    private fieldInfos: ValidatedFieldInfo[] = [];
    private tags: string[] = [];
    private property: string;
    private values: string[] = [];
    private cache = new Map<string, string[]>();
    private loading = false;
    private excludedValue?: string;
    private targetMatch = /^(.*),\s*([^,]*)/;

    constructor(
        private inputEl: HTMLInputElement,
        app: App,
        initialProperty: string,
        private onSelectCb: (value: string) => void = () => {}
    ) {
        super(app, inputEl);
        this.property = initialProperty;
        this.reloadValues();
    }

    public setProperty(prop: string) {
        if (this.property !== prop) {
            this.property = prop;
            this.reloadValues();
        }
    }

    public setExcludedValue(value?: string) {
        if (this.excludedValue !== value) {
            this.excludedValue = value;
            this.reloadValues(); 
        }
    }

    public setValues(fieldInfos: ValidatedFieldInfo[]) {
        this.fieldInfos = fieldInfos;
        if (this.cache.has(this.property)) {
            this.cache.delete(this.property);
        }
        this.reloadValues();
    }

    public setTags(tags: string[]) {
        this.tags = tags;
        if (this.property === "tags") {
            this.reloadValues();
        }
    }

    private async reloadValues() {
        this.loading = true;
        
        if (this.property === "tags") {
            // Используем теги как источник значений
            const currentOpts = this.tags;
            this.values = this.excludedValue 
                ? currentOpts.filter(opt => opt !== this.excludedValue)
                : [...currentOpts];
        } else {
            // Оригинальная логика для fieldInfos
            if (!this.cache.has(this.property)) {
                const info = this.fieldInfos.find(f => f.name === this.property);
                if (info) {
                    const opts = await getOptionsString(info) ?? [];
                    this.cache.set(this.property, opts);
                } else {
                    this.cache.set(this.property, []);
                }
            }
            const currentOpts = this.cache.get(this.property) || [];
            this.values = this.excludedValue 
                ? currentOpts.filter(opt => opt !== this.excludedValue)
                : [...currentOpts];
        }
        
        this.loading = false;
    }

    getSuggestions(inputValue: string): string[] {
        if (this.loading) return [];
        const [, tail] = this.splitInput(inputValue);
        return tail.trim() === "" ? this.values : this.fuzzySearch(tail);
    }

    private splitInput(v: string): [string, string] {
        const m = v.match(this.targetMatch);
        return m ? [m[1], m[2]] : ["", v];
    }

    private fuzzySearch(term: string): string[] {
        if (!term || term.length < 1) return [];
        const f = prepareFuzzySearch(term);
        return this.values
            .map(v => [v, f(v)] as [string, SearchResult | null])
            .filter(([, r]) => r !== null && r.score > -2)
            .sort((a, b) => b[1]!.score - a[1]!.score)
            .map(([v]) => v);
    }

    renderSuggestion(suggestion: string, el: HTMLElement): void {
        el.setText(suggestion);
    }

    selectSuggestion(suggestion: string): void {
        const [head] = this.splitInput(this.inputEl.value);
        const newValue = head ? `${head}, ${suggestion}` : suggestion;
        this.onSelectCb(newValue);
        this.inputEl.value = newValue;
        this.inputEl.dispatchEvent(new Event("input"));
        this.close();
    }
}