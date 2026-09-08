<script lang="ts">
  let { filled = false, class: className = 'w-5 h-5',
    ...restProps
  }: { filled?: boolean; class?: string;
    [key: string]: unknown;
  } = $props();
</script>
<svg
  {...restProps}
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill={filled ? 'currentColor' : 'none'}
  stroke={filled ? 'none' : 'currentColor'}
  stroke-width= "1.85"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  <g transform="translate(12 12) scale(0.9 1.2) rotate(-45) translate(-12 -12)">
    <path d="M3 4.2v6.972a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-6.972a1.2 1.2 0 0 0 -1.2 1.2" />
  </g>
</svg>
