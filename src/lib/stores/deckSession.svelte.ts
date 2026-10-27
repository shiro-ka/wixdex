import type { Card, DeckSummary } from '$lib/types';
import type { CloudDeckSync } from './cloudDeckSync.svelte';
import type { DeckBuilderStore } from './deckBuilder.svelte';

export class DeckSessionStore {
  isDeckListOpen = $state(false);
  isDeckEditOpen = $state(false);
  isUnsavedConfirmOpen = $state(false);
  deckPendingDelete = $state<DeckSummary | null>(null);

  #pendingAction: (() => void) | null = null;

  constructor(
    private deck: DeckBuilderStore,
    private cloud: CloudDeckSync,
    private isLoggedIn: boolean,
    private cardMap: () => Map<string, Card>,
  ) {}

  save = async (name: string, memo: string): Promise<void> => {
    if (!this.isLoggedIn) return;
    this.deck.setMeta(name, memo);
    const id = await this.cloud
      .save({
        id: this.deck.id ?? undefined,
        name: this.deck.name,
        memo: this.deck.memo,
        isPublic: this.deck.isPublic,
        mainDeck: this.deck.mainDeck,
        lrigDeck: this.deck.lrigDeck,
        candidateCards: this.deck.candidateCards,
      })
      .catch(() => null);
    if (id === null) return;
    this.deck.id = id;
    if (!this.deck.slug) this.deck.slug = id;
    this.deck.markSaved();
  };

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

  setPublic = async (next: boolean): Promise<void> => {
    if (!this.isLoggedIn || !this.deck.id) return;
    this.deck.isPublic = next;
    await this.save(this.deck.name, this.deck.memo);
  };

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
    if (d.id === this.deck.id) this.deck.reset();
    await this.cloud.delete(d.id);
  };

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

  confirmSave = async (): Promise<void> => {
    await this.save(this.deck.name, this.deck.memo);
    if (this.deck.isSaved) this.#runPending();
  };

  discard = (): void => this.#runPending();

  cancelConfirm = (): void => {
    this.#pendingAction = null;
    this.isUnsavedConfirmOpen = false;
  };
}
