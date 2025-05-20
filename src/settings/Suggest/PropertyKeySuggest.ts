import { App } from "obsidian";
import { AbstractOneValueFuzzySuggest } from "./AbstractOneValueFuzzySuggest";
import type { ValidatedFieldInfo } from "types/metadataMenuSchemas";

export interface PropertyInfo {
    count: number;

    name: string;
    type: string;
}
export class PropertyKeySuggest extends AbstractOneValueFuzzySuggest {
  private values: string[] = [];
  private loading = true;

  constructor(inputEl: HTMLInputElement, app: App) {
    super(inputEl, app);
  }

  public setValues(values: string[]) {
    this.values = values;
    this.loading = false;
  }

  getContent(): string[] {
    return this.loading ? [] : this.values;
  }
}