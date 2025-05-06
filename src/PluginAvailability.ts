import { App, Notice } from "obsidian";
import { type IMetadataMenuApi } from "metadatamenu"


const DATAVIEW = {
    id: "dataview",
    name: "Dataview"
};
const METADATA_MENU = {
    id: "metadata-menu",
    name: "Metadata Menu"
};

const DATAVIEW_PLUGING_ID = "dataview";
const DATAVIEW_PLUGIN_NAME = "Dataview";

const METADATAMENU_PLUGING_ID = "metadata-menu";
const METADATAMENU_PLUGIN_NAME = "Metadata Menu";

export function checkPluginAvailability(app: App, pluginID: string, pluginName: string): boolean {

    // source: https://github.com/mdelobelle/metadatamenu/blob/master/main.ts

    //@ts-ignore
    if (!app.plugins.enabledPlugins.has(pluginID)) {
        new Notice(
            `------------------------------------------\n` +
            `(!) INFO (!) \n` +
            `Install and enable ${pluginName} for the plugin to work\n` +
            `------------------------------------------`);
        return false;
    }
    return true;
}

export function checkAvailabilityDataview(app: App) {
    return checkPluginAvailability(app, DATAVIEW.id, DATAVIEW.name);
}
export function checkAvailabilityMetadataMenu(app: App) {
    return checkPluginAvailability(app, METADATA_MENU.id, METADATA_MENU.name);
}

export function GetMetadataMenuApi(app: App): IMetadataMenuApi {
    // types : 
    // - https://github.com/eth-p/obsidian-undocumented/blob/master/src/typings/plugin-manager.d.ts#L13
    // - https://github.com/mdelobelle/metadatamenu/blob/master/src/MetadataMenuApi.ts

    //@ts-ignore
    const rawApi = app.plugins.getPlugin(METADATA_MENU.id).api;
    const api = rawApi as IMetadataMenuApi;

    return api;
}