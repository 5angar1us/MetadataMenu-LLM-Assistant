import type AutoClassifierPlugin from "main";

let pluginInstance: AutoClassifierPlugin | null = null;

export const setPluginInstance = (instance: AutoClassifierPlugin) => {
    pluginInstance = instance;
};

export const getPluginInstance = (): AutoClassifierPlugin => {
    if (!pluginInstance) {
        throw new Error('Plugin instance not initialized!');
    }
    return pluginInstance;
};