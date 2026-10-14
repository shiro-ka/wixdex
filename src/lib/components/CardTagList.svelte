<script lang="ts">
  import { loadTagIndex, tagKinds } from '$lib/utils/tagIndex';

  interface Props {
    tags: string[];
  }
  let { tags }: Props = $props();

  // ★いまは表示だけ。押したときの動き（そのタグで絞り込む等）を足すときは、
  //   ここに onSelect を生やして .tag を button にすれば済むように、1枚の部品に閉じてある。
  let kinds = $state<Map<string, string>>(new Map());
  $effect(() => {
    loadTagIndex().then((index) => {
      kinds = tagKinds(index);
    });
  });
</script>

<ul class="list" data-suisou-layout="row wrap">
  {#each tags as t (t)}
    {@const kind = kinds.get(t)}
    <li class="tag" data-suisou-item="tag">
      {#if kind}<span class="kind" data-suisou="sub">{kind}</span>{/if}<span>{t}</span>
    </li>
  {/each}
</ul>

<style>
  /* すきま 6px は CardPopup のチップと同じ（Suisou の段に無い値） */
  .list {
    gap: 6px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  /* 種類は小さく添える。クラスのタグは「そのクラスを持つ」ではなく「そのクラスをサポートする」なので、
     すぐ上のルリグタイプ/クラスのチップ（奏械：バーチャル 等）と見分けられるようにする */
  .kind {
    font-size: 0.85em;
    margin-inline-end: 0.4em;
  }
</style>
