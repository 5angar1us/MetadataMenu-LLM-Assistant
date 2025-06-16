import { App } from "obsidian";
import { DataviewApi } from "obsidian-dataview";
import { AbstractOneValueFuzzySuggest } from "./AbstractOneValueFuzzySuggest";
import type { ValidatedFieldInfo } from "MetadataMenuOptionsResolver/types/metadataMenuSchemas";
import { getOptionsString } from "MetadataMenuOptionsResolver/GetOptions"

export class PropertyValueSuggest extends AbstractOneValueFuzzySuggest {
    private fieldInfos: Array<ValidatedFieldInfo> = [];
    private values: string[];
    private loading = true;
    private cache = new Map<string, string[]>();

    constructor(
        inputEl: HTMLInputElement,
        app: App,
        private property: string
    ) {
        super(inputEl, app);
    }

    public setValues(fieldInfos: Array<ValidatedFieldInfo>) {
        this.fieldInfos = fieldInfos
        this.reloadValues();
    }

    public setProperty(targetPropert: string) {
        if (targetPropert !== this.property) {
            this.property = targetPropert;
            this.reloadValues();
        }
    }

    private async reloadValues() {
        this.loading = true;

        if (this.cache.has(this.property)) {
            this.values = this.cache.get(this.property)!;
            this.loading = false;
            return;
        }

        const fieldInfo = this.fieldInfos.find(x => x.name == this.property);
        if (!fieldInfo) return;
        const values = await getOptionsString(fieldInfo) ?? [];
        this.values = values;
        this.cache.set(this.property, values);

        this.loading = false;
    }

    getContent(): string[] {
        return this.loading ? [] : this.values;
    }
}
