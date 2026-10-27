import { getSettings, saveSettings, type UserSettings } from '$lib/utils/storage';

export class SettingsStore {
  showLifeBurst = $state(false);
  showCandidateIcon = $state(false);
  rotateLandscape = $state(false);

  restore(): void {
    const s = getSettings();
    this.showLifeBurst = s.showLifeBurst;
    this.showCandidateIcon = s.showCandidateIcon;
    this.rotateLandscape = s.rotateLandscape;
  }

  toggle = (key: keyof UserSettings): void => {
    this[key] = !this[key];
    saveSettings({
      showLifeBurst: this.showLifeBurst,
      showCandidateIcon: this.showCandidateIcon,
      rotateLandscape: this.rotateLandscape,
    });
  };
}
