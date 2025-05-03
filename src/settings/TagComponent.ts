import { getFrontmatterSetting } from 'frontmatter';

import { BaseSettingsComponent } from './BaseSettingsComponent';
import { DEFAULT_TAG_SETTING } from './DefaultSettings';

export class TagComponent extends BaseSettingsComponent {
	display(containerEl: HTMLElement): void {
		containerEl.empty();
		this.addTagSettings(containerEl);
		this.addOverwriteSetting(containerEl, this.plugin.settings.frontmatter[DEFAULT_TAG_SETTING.id]);
	}

	private addTagSettings(containerEl: HTMLElement): void {
		const tagSetting = getFrontmatterSetting(
			DEFAULT_TAG_SETTING.id,
			this.plugin.settings.frontmatter
		);

		this.addCountSetting(
			containerEl,
			tagSetting,
			'Tags',
			'Default settings for automatic tag assignment',
			DEFAULT_TAG_SETTING.count
		);
	}
}
