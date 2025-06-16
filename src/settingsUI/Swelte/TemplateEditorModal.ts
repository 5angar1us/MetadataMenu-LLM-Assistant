import { App, Modal } from 'obsidian';
import type AutoClassifierPlugin from 'main';
import TemplateEditor from './FrontmatterComponent/TemplateEditor.svelte';
import { generateId } from 'MetadataEnricher/frontmatter';
import { typeDeepCopy } from 'utils/typeDeepCopy';
import type { FormatTemplate } from 'settingsUI';

export class TemplateEditorModal extends Modal {
    component: TemplateEditor;
    private currentDraftTemplate: FormatTemplate; // To hold the state within the modal

    constructor(
        app: App,
        private plugin: AutoClassifierPlugin,
        private onConfirm: (format: FormatTemplate) => void,
        private existingFormatTemplate?: FormatTemplate,
    ) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        const container = contentEl.createDiv();

        const baseTemplate = this.existingFormatTemplate || {
            id: generateId(),
            name: '',
            sourceNotePath: '',
            controlFieldValue: '',
            frontmatters: [],
        };
        
        this.currentDraftTemplate = typeDeepCopy(baseTemplate);

        this.component = new TemplateEditor({
            target: container,
            props: {
                plugin: this.plugin,
                // This onUpdate callback will be triggered by TemplateEditor for any change
                onUpdate: (updatedDraft: FormatTemplate) => {
                    this.currentDraftTemplate = updatedDraft;
                    // If editing an existing template, save changes live
                    if (this.existingFormatTemplate) {
                        this.onConfirm(this.currentDraftTemplate);
                    }
                },
                initialFormatTemplate: this.currentDraftTemplate, // Pass the draft
            }
        });
    }

    onClose() {
        // If it was a new template, confirm it on close, but only if valid (e.g., has a name)

        const templateHasHame = this.currentDraftTemplate.name.trim() !== '';
        if (!this.existingFormatTemplate && templateHasHame) {
            this.onConfirm(this.currentDraftTemplate);
        }

        const { contentEl } = this;
        if (this.component) {
            this.component.$destroy();
        }
        contentEl.empty();
    }
}
