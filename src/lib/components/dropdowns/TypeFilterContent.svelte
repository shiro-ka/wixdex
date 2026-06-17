<script lang="ts">
  import FilterChecklist from './FilterChecklist.svelte';

  interface Props {
    selectedTypes: Set<string>;
    onToggle: (type: string) => void;
  }
  let { selectedTypes, onToggle }: Props = $props();

  const items = [
    { value: 'ルリグ', label: 'ルリグ（センター）' },
    { value: 'アシスト', label: 'アシストルリグ' },
    { value: 'ピース', label: 'ピース' },
    { value: 'アーツ', label: 'アーツ' },
    { value: 'シグニ', label: 'シグニ' },
    { value: 'スペル', label: 'スペル' },
  ];
</script>

<FilterChecklist {items} selected={selectedTypes} {onToggle} columns={2} />
