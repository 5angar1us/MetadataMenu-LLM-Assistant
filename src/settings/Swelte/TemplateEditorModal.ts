import { App, Modal } from 'obsidian';
import type AutoClassifierPlugin from 'main';
import TemplateEditor from './FrontmatterComponent/TemplateEditor.svelte';
import type { FormatTemplate } from 'Providers/ProvidersSetup/shared/Types';

export class TemplateEditorModal extends Modal {
    component: TemplateEditor;

    constructor(
        app: App,
        private plugin: AutoClassifierPlugin,
        private onSubmit: (format: FormatTemplate) => void,
        private formatTemplate?: FormatTemplate,) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const container = contentEl.createDiv();

        this.component = new TemplateEditor({
            target: container,
            props: {
                plugin: this.plugin,
                onSubmit: this.onSubmit,
                formatTemplate: this.formatTemplate,
            }
        });
    }

    onClose() {
        const { contentEl } = this;

        if (this.component) {
            this.component.$destroy();
        }
        contentEl.empty();
    }
}