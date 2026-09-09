import { getSettings, saveSettings, type UserSettings } from '$lib/utils/storage';

/**
 * 表示設定（LBアイコン・候補アイコン・横向きカードの回転）。
 *
 * ★項目ごとにトグル関数を書かない。以前は3つの関数がそれぞれ3項目すべてを
 *   保存し直していて、項目を1つ増やすたびに3箇所の書き換えが要った。
 *   鍵で回す形にしてあるので、増えるのは UserSettings の1行だけで済む。
 *
 * localStorage は SSR で触れないので、読み出しは restore() を onMount から呼ぶ。
 */
export class SettingsStore {
  showLifeBurst = $state(false);
  showCandidateIcon = $state(false);
  rotateLandscape = $state(false);

  /** localStorage から復元する。クライアントでのみ呼ぶこと。 */
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
