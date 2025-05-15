<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import FrontmatterCard from './FrontmatterCard.svelte';
  import type { TemplateProperty } from 'Providers/ProvidersSetup/shared/Types';


  export let item: TemplateProperty; 
  export let frontmatterCardRefs: Map<number, { setExpanded: (value: boolean) => void }>; 

  let componentRef: FrontmatterCard; 

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (componentRef && frontmatterCardRefs) {
      //ComponentRef here is an instance of the FrontmatterCard,
      // which has the exported setExpanded method
      frontmatterCardRefs.set(item.id, componentRef);
    }
  });

  onDestroy(() => {
    if (frontmatterCardRefs) {
      frontmatterCardRefs.delete(item.id);
    }
  });

  function forwardSettingsChange(event: CustomEvent) {
    dispatch('settingsChange', event.detail);
  }

  function forwardDelete(event: CustomEvent) {
    dispatch('delete', event.detail);
  }
</script>

<FrontmatterCard
  bind:this={componentRef}
  frontmatterSetting={item}
  frontmatterId={item.id}
  on:settingsChange={forwardSettingsChange}
  on:delete={forwardDelete}
/>
