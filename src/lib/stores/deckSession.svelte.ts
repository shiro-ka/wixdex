import type { Card, DeckSummary } from '$lib/types';
import type { CloudDeckSync } from './cloudDeckSync.svelte';
import type { DeckBuilderStore } from './deckBuilder.svelte';

/**
 * 編集中のデッキとサーバーの往復をまとめる層。
 *
 * DeckBuilderStore は「いま何が入っているか」、CloudDeckSync は「サーバーとの通信」
 * しか知らない。その2つを繋ぐ手続き（保存・読み込み・削除）と、
 * 未保存のまま別のデッキへ移ろうとしたときの確認は、どちらの持ち物でもないので
 * ここに置く。ページはこのストアの状態を見るだけになる。
 */
export class DeckSessionStore {
  isDeckListOpen = $state(false);
  isDeckEditOpen = $state(false);
  isUnsavedConfirmOpen = $state(false);
  deckPendingDelete = $state<DeckSummary | null>(null);

  /** 確認を挟んだあとに実行する操作。確認が要らなければ即実行される。 */
  #pendingAction: (() => void) | null = null;

  /**
   * cardMap は関数で受け取る。保存されたデッキはカードIDの列なので、
   * 読み込みは**確認ダイアログを抜けたあと**に走る ―― その時点の対応表を
   * 引きたい。値で持つと確認を挟んだぶん古い対応表を掴む。
   */
  constructor(
    private deck: DeckBuilderStore,
    private cloud: CloudDeckSync,
    private isLoggedIn: boolean,
    private cardMap: () => Map<string, Card>,
  ) {}

  // ── 保存 ───────────────────────────────────────────────────
  save = async (name: string, memo: string): Promise<void> => {
    if (!this.isLoggedIn) return;
    this.deck.setMeta(name, memo);
    try {
      const id = await this.cloud.save({
        id: this.deck.id ?? undefined,
        name: this.deck.name,
        memo: this.deck.memo,
        isPublic: this.deck.isPublic,
        mainDeck: this.deck.mainDeck,
        lrigDeck: this.deck.lrigDeck,
        candidateCards: this.deck.candidateCards,
      });
      this.deck.id = id;
      if (!this.deck.slug) this.deck.slug = id; // 新規保存時の既定 slug は id
      this.deck.markSaved();
    } catch {
      // 失敗は cloud.error に載る
    }
  };

  /** ヘッダーの保存ボタン。新規は名前を聞き、既存はそのまま保存する。 */
  saveOrAsk = (): void => {
    if (!this.isLoggedIn) return;
    if (this.deck.id) this.save(this.deck.name, this.deck.memo);
    else this.isDeckEditOpen = true;
  };

  updateSlug = async (slug: string) => {
    if (!this.deck.id) return { ok: false as const, error: 'デッキを保存してください。' };
    const res = await this.cloud.updateSlug(this.deck.id, slug);
    if (res.ok) this.deck.slug = res.slug;
    return res;
  };

  /** 公開/非公開は切り替えた時点で保存まで済ませる（保存済みデッキのみ）。 */
  setPublic = async (next: boolean): Promise<void> => {
    if (!this.isLoggedIn || !this.deck.id) return;
    this.deck.isPublic = next;
    await this.save(this.deck.name, this.deck.memo);
  };

  // ── 一覧・読み込み・削除 ───────────────────────────────────
  openList = async (): Promise<void> => {
    if (!this.isLoggedIn) return;
    await this.cloud.loadList();
    this.isDeckListOpen = true;
  };

  requestDelete = (d: DeckSummary): void => {
    this.deckPendingDelete = d;
  };

  cancelDelete = (): void => {
    this.deckPendingDelete = null;
  };

  confirmDelete = async (): Promise<void> => {
    const d = this.deckPendingDelete;
    this.deckPendingDelete = null;
    if (!d) return;
    if (d.id === this.deck.id) this.deck.reset(); // 編集中のものを消したら手元も空にする
    await this.cloud.delete(d.id);
  };

  // ── 未保存のガード ─────────────────────────────────────────
  // 未保存のまま別のデッキへ移ろうとしたときだけワンクッション挟む。
  #guard(action: () => void): void {
    if (this.deck.isSaved) {
      action();
    } else {
      this.#pendingAction = action;
      this.isUnsavedConfirmOpen = true;
    }
  }

  requestNew = (): void => this.#guard(() => this.deck.reset());

  requestLoad = (d: DeckSummary): void =>
    this.#guard(async () => {
      const loaded = await this.cloud.loadFull(d.id, this.cardMap());
      if (loaded) this.deck.load(loaded);
    });

  #runPending(): void {
    const action = this.#pendingAction;
    this.#pendingAction = null;
    this.isUnsavedConfirmOpen = false;
    action?.();
  }

  /** 確認ダイアログの「保存して続ける」。保存できたときだけ先へ進む。 */
  confirmSave = async (): Promise<void> => {
    await this.save(this.deck.name, this.deck.memo);
    if (this.deck.isSaved) this.#runPending();
  };

  /** 確認ダイアログの「保存せずに続ける」。 */
  discard = (): void => this.#runPending();

  /** 確認ダイアログを閉じるだけ。 */
  cancelConfirm = (): void => {
    this.#pendingAction = null;
    this.isUnsavedConfirmOpen = false;
  };
}
