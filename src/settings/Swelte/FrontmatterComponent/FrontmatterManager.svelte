<script>
    import { onMount } from 'svelte';
    import FrontmatterCard from './FrontmatterCard.svelte';
    import { WikiLinkSelector } from '../../WikiLinkSelector';
  
    export let plugin; // Экземпляр основного плагина
    
    let frontmatters = [];
    
    onMount(() => {
      frontmatters = plugin.settings.frontmatter || [];
    });
    
    async function handleSettingsChange(event) {
      const { frontmatterId, updatedSetting } = event.detail;
      
      // Обновляем настройки в массиве
      const index = frontmatters.findIndex(f => f.id === frontmatterId);
      if (index !== -1) {
        frontmatters[index] = updatedSetting;
        
        // Обновляем настройки в плагине
        plugin.settings.frontmatter = [...frontmatters];
        await plugin.saveSettings();
      }
    }
    
    async function handleDelete(event) {
      const { frontmatterId } = event.detail;
      
      // Удаляем фронтматтер из массива
      frontmatters = frontmatters.filter(f => f.id !== frontmatterId);
      
      // Обновляем настройки в плагине
      plugin.settings.frontmatter = [...frontmatters];
      await plugin.saveSettings();
    }
    
    function handleBrowse(frontmatterId) {
      const wikiLinkSelector = new WikiLinkSelector(plugin.app);
      wikiLinkSelector.openFileSelector((selectedLink) => {
        const formattedLink = `[[${selectedLink}]]`;
        const index = frontmatters.findIndex(f => f.id === frontmatterId);
        
        if (index !== -1) {
          const frontmatter = frontmatters[index];
          frontmatter.refs = [...(frontmatter.refs || []), formattedLink];
          
          // Обновляем состояние и сохраняем
          frontmatters = [...frontmatters];
          plugin.settings.frontmatter = [...frontmatters];
          plugin.saveSettings();
        }
      });
    }
    
    async function addNewFrontmatter() {
      // Создаем ID для нового фронтматтера
      const newId = Math.max(0, ...frontmatters.map(f => f.id)) + 1;
      
      // Создаем новый фронтматтер с дефолтными значениями
      const newFrontmatter = {
        id: newId,
        name: 'New Frontmatter',
        linkType: 'Normal',
        overwrite: false,
        count: 5,
        refs: []
      };
      
      // Добавляем в массив
      frontmatters = [...frontmatters, newFrontmatter];
      
      // Обновляем настройки в плагине
      plugin.settings.frontmatter = [...frontmatters];
      await plugin.saveSettings();
    }
  </script>
  
  <div class="frontmatter-manager">
    <div class="frontmatter-list">
      {#each frontmatters as frontmatter (frontmatter.id)}
        <FrontmatterCard
          frontmatterSetting={frontmatter}
          frontmatterId={frontmatter.id}
          on:settingsChange={handleSettingsChange}
          on:delete={handleDelete}
          on:browse={() => handleBrowse(frontmatter.id)}
        />
      {/each}
    </div>
    
    <button class="add-frontmatter-button" on:click={addNewFrontmatter}>
      + Add New Frontmatter
    </button>
  </div>
  
  <style>
    .frontmatter-manager {
      padding: 16px;
    }
    
    .frontmatter-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .add-frontmatter-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 8px;
      background-color: var(--interactive-accent);
      color: var(--text-on-accent);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .add-frontmatter-button:hover {
      background-color: var(--interactive-accent-hover);
    }
  </style>