<script lang="ts">
  import FilterChecklist from './FilterChecklist.svelte';

  interface Props {
    selectedLrigClasses: Set<string>;
    onToggle: (lrigClass: string) => void;
  }
  let { selectedLrigClasses, onToggle }: Props = $props();

  type ClassGroup = { title: string; items: { value: string; label: string; count: number }[] };

  let groups = $state<ClassGroup[]>([]);
  $effect(() => {
    fetch('/assets/cards_json/classes.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((j: ClassGroup[]) => {
        groups = j;
      })
      .catch(() => {});
  });
</script>

<FilterChecklist {groups} selected={selectedLrigClasses} {onToggle} columns={3} />
