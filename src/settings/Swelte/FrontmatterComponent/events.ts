import type { FrontmatterTemplate } from "Providers/ProvidersSetup/shared/Types";

export type DispatchEventsDeleteButton = {
    delete: void;
};
export type DispatchEventsFrontmatterCard = {
    settingsChange: {
        frontmatterId: number;
        updatedFrontmatter: FrontmatterTemplate;
    };
    delete: {
        frontmatterId: number;
    };
};

export type SettingsChangeEvent = CustomEvent<DispatchEventsFrontmatterCard['settingsChange']>;
export type DeleteFrontmatterEvent = CustomEvent<DispatchEventsFrontmatterCard['delete']>;