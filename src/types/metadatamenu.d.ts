declare module "metadatamenu" {
    import type { TFile } from "obsidian";
  
    export declare enum FieldStyleLabel {
        "Add" = "add",
        "Remove" = "remove",
        "Replace" = "replace"
    }
    
    export declare type FieldType =
        | "Input"
        | "Number"
        | "Select"
        | "Cycle"
        | "Boolean"
        | "Date"
        | "DateTime"
        | "Time"
        | "Multi"
        | "File"
        | "MultiFile"
        | "Media"
        | "MultiMedia"
        | "Canvas"
        | "CanvasGroup"
        | "CanvasGroupLink"
        | "Formula"
        | "Lookup"
        | "JSON"
        | "YAML"
        | "Object"
        | "ObjectList";
    
    export declare interface IFieldInfo {
        id: string;
        name: string;
        type: FieldType;
        value: string;
        indexedPath: string | undefined;
        sourceType: "fileClass" | "settings";
        fileClassName: string | undefined;
        isValid: boolean;
        options: Record<string, any>;
        ignoredInMenu: boolean;
    }
    
    export declare type FieldPayload = {
        value: string;
        addToCurrentValues?: boolean;
        style?: Record<keyof typeof FieldStyleLabel, boolean>;
    };
    
    export declare type IndexedFieldsPayload = Array<{
        indexedPath: string;
        payload: FieldPayload;
    }>;
    
    export declare type NamedFieldsPayload = Array<{
        name: string;
        payload: FieldPayload;
    }>;
    
    export declare interface IMetadataMenuApi {
        getValues(fileOrFilePath: TFile | string, attribute: string): Promise<string[]>;
        getValuesForIndexedPath(fileOrFilePath: TFile | string, indexedPath: string): Promise<string>;
        fileFields(fileOrFilePath: TFile | string): Promise<Record<string, IFieldInfo>>;
        namedFileFields(fileOrFilePath: TFile | string): Promise<Record<string, IFieldInfo>>;
        
        // `dv` and `p` examples
        // https://github.com/mdelobelle/metadatamenu/blob/e2190a84124684bd335f567b6d9d6c054e804276/src/commands/fieldModifier.ts#L39
        // dv is DataviewInlineApi
        // https://github.com/blacksmithgu/obsidian-dataview/blob/5ad0994ff384cbb797de382e7edff2388141b73a/src/api/inline-api.ts#L279
        // because db.el(...)

        // p is ...
        // because p.file.path
        // js example
        // dv.current().file.path https://github.com/blacksmithgu/obsidian-dataview/blob/5ad0994ff384cbb797de382e7edff2388141b73a/docs/docs/api/code-examples.md?plain=1#L25

        // https://github.com/blacksmithgu/obsidian-dataview/blob/5ad0994ff384cbb797de382e7edff2388141b73a/src/api/inline-api.ts#L126
        // public current(): Record<string, any> | undefined {
        // return this.page(this.currentFilePath);
        // }


        fieldModifier(
            dv: DataViewApi,
            p: any,
            fieldName: string,
            attrs?: { cls?: string; attr?: Record<string, string>; options?: Record<string, string> }
        ): HTMLElement;
        insertMissingFields(
            fileOrFilePath: string | TFile,
            lineNumber: number,
            asList: boolean,
            asBlockquote: boolean,
            fileClassName?: string
        ): Promise<void>;
        postValues(
            fileOrFilePath: TFile | string,
            payload: IndexedFieldsPayload,
            lineNumber?: number,
            asList?: boolean,
            asBlockquote?: boolean
        ): Promise<void>;
        postNamedFieldsValues(
            fileOrFilePath: TFile | string,
            payload: NamedFieldsPayload,
            lineNumber?: number,
            asList?: boolean,
            asBlockquote?: boolean
        ): Promise<void>;
    }
  }