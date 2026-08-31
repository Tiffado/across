const mapNames = { red: "Rouge", green: "Vert", blue: "Bleu", yellow: "Jaune", turquoise: "Turquoise", void: "Void", necropolis: "Nécropole" };

let DATA = null;
let state = { acts: new Set(), affixes: new Set(), selectedItem: null };

async function loadData() {
  const res = await fetch('data/items.json');
  DATA = await res.json();
  buildFilters();
  render();
}

function buildFilters() {
  const acts = ["1", "2/3", "4"];
  const actContainer = document.getElementById('act-filters');
  acts.forEach(a => {
    const row = document.createElement('div');
    row.className = 'checkbox-row';
    const id = 'act-' + a.replace('/', '');
    row.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">Acte ${a}</label>`;
    row.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) state.acts.add(a); else state.acts.delete(a);
      render();
    });
    actContainer.appendChild(row);
  });

  const affixContainer = document.getElementById('affix-filters');
  DATA.affixTags.forEach(tag => {
    const count = DATA.items.filter(i => i.affixes.includes(tag.id)).length;
    if (count === 0) return;
    const row = document.createElement('div');
    row.className = 'checkbox-row';
    const id = 'affix-' + tag.id;
    row.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${tag.label_fr}</label><span class="count">${count}</span>`;
    row.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) state.affixes.add(tag.id); else state.affixes.delete(tag.id);
      render();
    });
    affixContainer.appendChild(row);
  });
}

function getConflictReason(itemId, otherId) {
  for (const rule of DATA.compatibilityRules) {
    if (rule.type === 'mutually_exclusive_items' && rule.items.includes(itemId) && rule.items.includes(otherId) && itemId !== otherId) {
      return rule.description;
    }
  }
  return null;
}

function isIncompatible(item) {
  if (!state.selectedItem) return false;
  if (item.id === state.selectedItem.id) return false;
  const directConflict = getConflictReason(item.id, state.selectedItem.id);
  if (directConflict) return directConflict;
  if (item.map && state.selectedItem.map && item.map !== state.selectedItem.map) {
    const bothPortalMaps = ["red", "green", "blue", "yellow", "turquoise"];
    const bothAct4Maps = ["void", "necropolis"];
    if (bothPortalMaps.includes(item.map) && bothPortalMaps.includes(state.selectedItem.map)) {
      return "Cartes différentes en Acte 2/3 — vérifiez que vos 2 portails de run incluent bien les deux.";
    }
    if (bothAct4Maps.includes(item.map) && bothAct4Maps.includes(state.selectedItem.map)) {
      return "Void et Nécropole sont mutuellement exclusifs en Acte 4.";
    }
  }
  return false;
}

function selectItem(item) {
  state.selectedItem = state.selectedItem && state.selectedItem.id === item.id ? null : item;
  render();
}

function clearSelection() {
  state.selectedItem = null;
  render();
}

function resetFilters() {
  state.acts.clear();
  state.affixes.clear();
  state.selectedItem = null;
  document.querySelectorAll('aside input[type=checkbox]').forEach(c => c.checked = false);
  render();
}

function render() {
  const grid = document.getElementById('item-grid');
  grid.innerHTML = '';

  let items = DATA.items;
  if (state.acts.size > 0) {
    items = items.filter(i => i.act && [...state.acts].some(a => i.act.includes(a)));
  }
  if (state.affixes.size > 0) {
    items = items.filter(i => [...state.affixes].every(a => i.affixes.includes(a)));
  }

  const banner = document.getElementById('selected-banner');
  if (state.selectedItem) {
    banner.classList.add('active');
    document.getElementById('selected-name').textContent = state.selectedItem.name;
  } else {
    banner.classList.remove('active');
  }

  document.getElementById('result-count').textContent = items.length + ' objet(s) affiché(s)';

  if (items.length === 0) {
    grid.innerHTML = '<div class="empty">Aucun objet ne correspond à ces filtres.</div>';
    return;
  }

  items.forEach(item => {
    const conflict = isIncompatible(item);
    const card = document.createElement('div');
    card.className = 'item-card';
    if (state.selectedItem && state.selectedItem.id === item.id) card.classList.add('selected');
    if (conflict) card.classList.add('incompatible');

    const mapLabel = item.map ? mapNames[item.map] : 'Générique';
    const actLabel = item.act ? 'Acte ' + item.act : '—';

    card.innerHTML = `
      <p class="item-name">${item.name}</p>
      <p class="item-meta">${mapLabel} · ${actLabel} · confiance ${item.confidence}</p>
      <p class="item-effect">${item.effect}</p>
      <div class="tag-row">${item.affixes.map(a => `<span class="tag">${DATA.affixTags.find(t => t.id === a)?.label_fr || a}</span>`).join('')}</div>
      <p class="location-note">${item.location}</p>
      ${conflict ? `<div class="conflict-note">Incompatible : ${conflict}</div>` : ''}
    `;

    card.addEventListener('click', () => {
      if (conflict) return;
      selectItem(item);
    });

    grid.appendChild(card);
  });
}

document.getElementById('reset-btn').addEventListener('click', resetFilters);
document.getElementById('clear-selection-btn').addEventListener('click', clearSelection);

loadData();
