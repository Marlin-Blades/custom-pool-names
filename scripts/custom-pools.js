import { PoolSettings } from './settings.js';

Hooks.once('init', () => {
  console.log('Custom Pool Names | Initializing');
});

// Character sheet rendering hook
Hooks.on('renderCypherActorSheetPC', async (app, html, data) => {
  const actor = app.actor;
  await PoolSettings.createPoolNameFlags(actor);
  const poolNames = PoolSettings.getPoolNames(actor);
  
  const poolTypes = ['might', 'speed', 'intellect'];
  poolTypes.forEach(poolType => {
    const label = html.find(`label[for="actor.system.pools.${poolType}"]`);
    if (label.length) {
      const input = $(`<input type="text" class="pool-name-input" value="${poolNames[poolType]}">`);
      label.html(input);
      
      input.on('change', async (event) => {
        await PoolSettings.updatePoolName(actor, poolType, event.target.value);
      });
    }
  });
});

// Roll dialog hook
Hooks.on('renderRollEngineDialogSheet', async (app, html, data) => {
  const actor = fromUuidSync(data.actorUuid);
  if (!actor) return;

  const poolNames = PoolSettings.getPoolNames(actor);
  const poolOptions = {
    'Might': poolNames.might,
    'Speed': poolNames.speed,
    'Intellect': poolNames.intellect
  };

  // Update dropdown options
  const poolSelect = html.find('select[name="pool"]');
  poolSelect.find('option').each(function() {
    const value = $(this).attr('value');
    if (poolOptions[value]) {
      $(this).text(poolOptions[value]);
    }
  });

  // Update preview section
  const previewSection = html.find('.roll-engine-summary-bottom');
  previewSection.find('text:contains("Might Pool")').text(poolNames.might + ' Pool');
  previewSection.find('text:contains("Speed Pool")').text(poolNames.speed + ' Pool');
  previewSection.find('text:contains("Intellect Pool")').text(poolNames.intellect + ' Pool');
});

// Chat message modification
Hooks.on('rollEngineOutput', (actor, rollData) => {
    if (!actor) return;
    
    const poolNames = PoolSettings.getPoolNames(actor);
    
    // Check if the rollData has pool cost information
    if (rollData.pool && rollData.poolPointCost) {
        // Modify the pool name before the roll engine generates the chat message
        rollData.summaryTotalCostString = rollData.summaryTotalCostString
            .replace('Might points', `${poolNames.might} points`)
            .replace('Speed points', `${poolNames.speed} points`)
            .replace('Intellect points', `${poolNames.intellect} points`);
            
        rollData.summaryTitle = rollData.summaryTitle
            .replace('Might Pool', `${poolNames.might} Pool`)
            .replace('Speed Pool', `${poolNames.speed} Pool`)
            .replace('Intellect Pool', `${poolNames.intellect} Pool`);
    }
});

// Backup method to catch any messages that might slip through
Hooks.on('preCreateChatMessage', (message, options) => {
    const actor = fromUuidSync(message.flags?.data?.actorUuid || message.flags?.rollData?.actorUuid);
    if (!actor) return;

    const poolNames = PoolSettings.getPoolNames(actor);
    let content = message.content;

    const replacements = [
        ['Might Pool', `${poolNames.might} Pool`],
        ['Speed Pool', `${poolNames.speed} Pool`],
        ['Intellect Pool', `${poolNames.intellect} Pool`],
        ['Might points', `${poolNames.might} points`],
        ['Speed points', `${poolNames.speed} points`],
        ['Intellect points', `${poolNames.intellect} points`]
    ];

    replacements.forEach(([original, replacement]) => {
        content = content.replaceAll(original, replacement);
    });

    message.updateSource({content: content});
});

// UI update hook
Hooks.on('updateActor', (actor, changes, options, userId) => {
  if (changes.flags?.['custom-pool-names']) {
    actor.sheet.render(true);
  }
});