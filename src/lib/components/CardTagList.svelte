<script lang="ts">
  import { loadTagIndex, tagKinds } from '$lib/utils/tagIndex';

  interface Props {
    tags: string[];
  }
  let { tags }: Props = $props();

  let kinds = $state<Map<string, string>>(new Map());
  $effect(() => {
    loadTagIndex().then((index) => {
      kinds = tagKinds(index);
    });
  });
</script>

<ul class="list" data-suisou-layout="row wrap gap-1">
  {#each tags as t (t)}
    {@const kind = kinds.get(t)}
    <li class="tag" data-suisou-item="tag">
      {#if kind}<span class="kind" data-suisou="note">{kind}</span>{/if}<span>{t}</span>
    </li>
  {/each}
</ul>

<style>
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .kind {
    font-size: 0.85em;
    margin-inline-end: 0.4em;
  }
</style>
