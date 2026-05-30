/* ============================================================
   Where you can help — app.js
   Renders three views (Cards, Map, Table) + detail drawer.
   ============================================================ */

(function () {
  // Sort default order: verified -> verify -> posted-16, then by distance (nulls last).
  const STATUS_RANK = { 'verified': 0, 'verify': 1, 'posted-16': 2 };
  const OPPS = [...window.OPPORTUNITIES].sort((a, b) => {
    const sa = STATUS_RANK[a.soloStatus] ?? 9;
    const sb = STATUS_RANK[b.soloStatus] ?? 9;
    if (sa !== sb) return sa - sb;
    const da = a.distanceMi == null ? Infinity : a.distanceMi;
    const db = b.distanceMi == null ? Infinity : b.distanceMi;
    return da - db;
  });
  const ARDEN = window.ARDEN;

  // ---- ICONS ----
  const ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v4 M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>',
    block: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  };

  const CAT_ICON = {
    'Healthcare': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    'Animals': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>',
    'Environmental': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.6 0 5.56 5.56 0 0 1 3.8-1.5c1.63.226 2.65 1.213 3.9 2.2"/><path d="M2 16c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.6 0 5.56 5.56 0 0 1 3.8-1.5c1.63.226 2.65 1.213 3.9 2.2"/><path d="M2 10c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.6 0 5.56 5.56 0 0 1 3.8-1.5c1.63.226 2.65 1.213 3.9 2.2"/></svg>',
    'Civic / Legal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/></svg>',
    'Library': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    'Leadership': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    'Education': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6 M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    'Disaster Relief': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7 M8 21V11h8v10 M2 7l3-4h14l3 4Z"/></svg>',
    'Multi': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  };

  // ---- STATE ----
  let activeView = 'cards';
  let activeFilter = 'all';
  let map = null;
  let markers = {};
  let activeMarkerId = null;

  // ---- HELPERS ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function soloBadge(opp) {
    if (opp.soloStatus === 'verified') {
      return `<span class="solo-badge solo-verified" title="Verified solo OK">${ICON.check} Verified solo</span>`;
    }
    if (opp.soloStatus === 'verify') {
      return `<span class="solo-badge solo-verify" title="Call to verify age policy">${ICON.alert} Call to verify</span>`;
    }
    return `<span class="solo-badge solo-posted-16" title="Posted minimum age is 16">${ICON.block} Posted 16+</span>`;
  }

  function soloCalloutTitle(opp) {
    if (opp.soloStatus === 'verified') return `${ICON.check} Verified: solo 15-year-old OK`;
    if (opp.soloStatus === 'verify') return `${ICON.alert} Call to verify age policy`;
    return `${ICON.block} Posted minimum age 16 — ask about a waiver`;
  }

  function filterOpps(list) {
    if (activeFilter === 'all') return list;
    if (activeFilter === 'closest') {
      return [...list].sort((a, b) => {
        if (a.distanceMi == null) return 1;
        if (b.distanceMi == null) return -1;
        return a.distanceMi - b.distanceMi;
      });
    }
    return list.filter(o => o.category === activeFilter);
  }

  // ---- CARDS VIEW ----
  function renderCards() {
    const list = filterOpps(OPPS);
    const grid = $('#cards-grid');
    grid.innerHTML = list.map((opp, i) => `
      <button class="card" data-opp-id="${opp.id}" aria-label="View ${opp.name} details">
        <div class="card-thumb ${opp.categoryColor}" aria-hidden="true">${CAT_ICON[opp.category] || CAT_ICON['Multi']}</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom: var(--s-3);">
          ${soloBadge(opp)}
          <span class="cat-tag ${opp.categoryColor}">${opp.category}</span>
        </div>
        <div class="card-name">${opp.name}</div>
        <div class="card-fit">${opp.fit}</div>
        <div class="card-meta">
          ${opp.distanceMi != null ? `<span class="meta-pill distance">${ICON.map} ${opp.distanceMi} mi</span>` : `<span class="meta-pill">${ICON.map} Remote</span>`}
          <span class="meta-pill">${ICON.user} ${opp.ages}</span>
        </div>
        <div class="card-actions">
          ${opp.phone
            ? `<a class="card-action" href="tel:${opp.phone.replace(/[^\d+]/g,'')}" onclick="event.stopPropagation()">${ICON.phone} Call</a>`
            : `<span class="card-action disabled">${ICON.phone} No phone</span>`}
          <span class="card-action primary">Details →</span>
        </div>
      </button>
    `).join('');

    grid.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        openDrawer(card.dataset.oppId);
      });
    });
  }

  // ---- MAP VIEW ----
  function renderMapList() {
    const list = filterOpps(OPPS).filter(o => o.lat != null);
    const remote = filterOpps(OPPS).filter(o => o.lat == null);
    const aside = $('#map-list');
    aside.innerHTML = list.map((opp, i) => `
      <button class="map-list-item" data-opp-id="${opp.id}">
        <div class="map-list-num">${i + 1}</div>
        <div class="map-list-content">
          <div class="map-list-name">${opp.name}</div>
          <div class="map-list-meta">
            ${opp.distanceMi != null ? `${opp.distanceMi} mi` : ''} · ${opp.category}
          </div>
          <div style="margin-top: 6px;">${soloBadge(opp)}</div>
        </div>
      </button>
    `).join('') + (remote.length ? `
      <div style="padding: var(--s-3); margin-top: var(--s-2); border-top: 1px solid var(--divider);">
        <div style="font-size: var(--text-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: var(--s-2);">Remote / Online</div>
        ${remote.map(opp => `
          <button class="map-list-item" data-opp-id="${opp.id}" style="border-left-color: transparent;">
            <div class="map-list-num" style="background: var(--text-muted);">${ICON.link}</div>
            <div class="map-list-content">
              <div class="map-list-name">${opp.name}</div>
              <div class="map-list-meta">Remote · ${opp.category}</div>
              <div style="margin-top: 6px;">${soloBadge(opp)}</div>
            </div>
          </button>
        `).join('')}
      </div>
    ` : '');

    aside.querySelectorAll('.map-list-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.oppId;
        const opp = OPPS.find(o => o.id === id);
        if (opp.lat && map && markers[id]) {
          map.flyTo([opp.lat, opp.lng], 13, { duration: 0.8 });
          markers[id].openPopup();
          setActiveMarker(id);
        } else {
          openDrawer(id);
        }
      });
    });
  }

  function setActiveMarker(id) {
    activeMarkerId = id;
    $$('.map-list-item').forEach(el => {
      el.classList.toggle('active', el.dataset.oppId === id);
    });
  }

  function makePinIcon(num, isArden = false) {
    return L.divIcon({
      className: 'custom-pin-wrap',
      html: `<div class="custom-pin ${isArden ? 'arden' : ''}"><span>${num}</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 28],
      popupAnchor: [0, -28],
    });
  }

  function initMap() {
    if (map) return;
    if (typeof L === 'undefined') {
      setTimeout(initMap, 100);
      return;
    }
    map = L.map('leaflet-map', { scrollWheelZoom: false }).setView([ARDEN.lat + 0.06, ARDEN.lng - 0.02], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Arden reference pin
    L.marker([ARDEN.lat, ARDEN.lng], {
      icon: L.divIcon({
        className: 'custom-pin-wrap',
        html: `<div class="custom-pin arden"><span>★</span></div>`,
        iconSize: [32, 32], iconAnchor: [16, 28], popupAnchor: [0, -28],
      }),
    }).addTo(map).bindPopup('<div class="popup-name">Arden, NC</div><div class="popup-addr">Reference point</div>');

    const visibleList = OPPS.filter(o => o.lat != null);
    visibleList.forEach((opp, i) => {
      const m = L.marker([opp.lat, opp.lng], { icon: makePinIcon(i + 1) }).addTo(map);
      const phoneLink = opp.phone ? `<a class="popup-btn" href="tel:${opp.phone.replace(/[^\d+]/g,'')}">Call</a>` : '';
      m.bindPopup(`
        <div class="popup-name">${opp.name}</div>
        <div class="popup-addr">${opp.address}</div>
        <div style="margin-bottom: 8px;">${soloBadge(opp)}</div>
        <div class="popup-actions">
          ${phoneLink}
          <a class="popup-btn outline" href="#" data-opp-id="${opp.id}" data-open-drawer>Details</a>
        </div>
      `);
      m.on('popupopen', (e) => {
        setActiveMarker(opp.id);
        const link = e.popup.getElement().querySelector('[data-open-drawer]');
        if (link) link.addEventListener('click', (ev) => { ev.preventDefault(); openDrawer(opp.id); });
      });
      markers[opp.id] = m;
    });
  }

  function refreshMap() {
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 50);
  }

  // ---- TABLE VIEW ----
  function renderTable() {
    const list = filterOpps(OPPS);
    const tbody = $('#compare-tbody');
    tbody.innerHTML = list.map(opp => `
      <tr data-opp-id="${opp.id}">
        <td class="name-cell">
          ${opp.name}
          <span class="name-fit">${opp.fit}</span>
        </td>
        <td><span class="cat-tag ${opp.categoryColor}">${opp.category}</span></td>
        <td>${opp.distanceMi != null ? `${opp.distanceMi} mi` : '—'}</td>
        <td>${opp.ages}</td>
        <td class="solo-cell">${soloBadge(opp)}</td>
        <td>${opp.phone ? `<a href="tel:${opp.phone.replace(/[^\d+]/g,'')}" onclick="event.stopPropagation()">${opp.phone}</a>` : '<span style="color: var(--text-faint);">—</span>'}</td>
        <td>${opp.email ? `<a href="mailto:${opp.email}" onclick="event.stopPropagation()">${opp.email}</a>` : '<span style="color: var(--text-faint);">—</span>'}</td>
        <td style="font-size: var(--text-xs); color: var(--text-muted); max-width: 200px;">${opp.schedule}</td>
        <td><a href="${opp.website}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Open ↗</a></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => openDrawer(tr.dataset.oppId));
    });
  }

  // ---- DRAWER ----
  function openDrawer(id) {
    const opp = OPPS.find(o => o.id === id);
    if (!opp) return;
    const phoneDigits = opp.phone ? opp.phone.replace(/[^\d+]/g, '') : null;

    $('#drawer-body').innerHTML = `
      <div class="drawer-hero">
        <div class="drawer-thumb card-thumb ${opp.categoryColor}">${CAT_ICON[opp.category] || CAT_ICON['Multi']}</div>
        <div>
          <div class="drawer-name">${opp.name}</div>
          <div class="drawer-fit">${opp.fit}</div>
        </div>
      </div>

      <div class="solo-callout ${opp.soloStatus}">
        <div class="solo-callout-title">${soloCalloutTitle(opp)}</div>
        <div class="solo-callout-note">${opp.soloNote}</div>
      </div>

      <div class="drawer-section">
        <h3>At a glance</h3>
        <div class="drawer-row">${ICON.user}<div><strong>Ages</strong>${opp.ages}</div></div>
        <div class="drawer-row">${ICON.map}<div><strong>Distance from Arden</strong>${opp.distanceMi != null ? `${opp.distanceMi} mi` : 'Remote / online'}</div></div>
        <div class="drawer-row">${ICON.cal}<div><strong>Schedule</strong>${opp.schedule}</div></div>
        ${opp.contactPerson ? `<div class="drawer-row">${ICON.user}<div><strong>Contact</strong>${opp.contactPerson}</div></div>` : ''}
      </div>

      <div class="drawer-section">
        <h3>How to apply</h3>
        <div class="drawer-row" style="border-bottom:none;">${ICON.info}<div>${opp.apply}</div></div>
        ${opp.notes ? `<div class="drawer-row">${ICON.info}<div>${opp.notes}</div></div>` : ''}
      </div>

      <div class="drawer-section">
        <h3>Contact</h3>
        ${opp.address ? `<div class="drawer-row">${ICON.map}<div><strong>Address</strong>${opp.address}</div></div>` : ''}
        ${opp.phone ? `<div class="drawer-row">${ICON.phone}<div><strong>Phone</strong><a href="tel:${phoneDigits}">${opp.phone}</a>${opp.phoneAlt ? ` &middot; <a href="tel:${opp.phoneAlt.replace(/[^\d+]/g,'')}">${opp.phoneAlt}</a>` : ''}</div></div>` : ''}
        ${opp.email ? `<div class="drawer-row">${ICON.mail}<div><strong>Email</strong><a href="mailto:${opp.email}">${opp.email}</a></div></div>` : ''}
        ${opp.website ? `<div class="drawer-row">${ICON.link}<div><strong>Website</strong><a href="${opp.website}" target="_blank" rel="noopener">${opp.website}</a></div></div>` : ''}
      </div>

      <div class="drawer-cta">
        ${opp.phone
          ? `<a class="drawer-btn primary" href="tel:${phoneDigits}">${ICON.phone} Call now</a>`
          : `<span class="drawer-btn primary disabled">${ICON.phone} No phone</span>`}
        ${opp.email
          ? `<a class="drawer-btn secondary" href="mailto:${opp.email}">${ICON.mail} Email</a>`
          : `<span class="drawer-btn secondary disabled">${ICON.mail} No email</span>`}
        <a class="drawer-btn outline" href="${opp.website}" target="_blank" rel="noopener">${ICON.link} Open application page</a>
      </div>
    `;
    $('#drawer').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    $('#drawer').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ---- VIEW SWITCHING ----
  function switchView(v) {
    activeView = v;
    $$('.view-btn').forEach(b => {
      const on = b.dataset.view === v;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    $$('.view').forEach(s => s.classList.toggle('active', s.id === `view-${v}`));
    if (v === 'map') {
      initMap();
      refreshMap();
    }
  }

  // ---- THEME ----
  function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    $('[data-theme-toggle]').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- INIT ----
  function init() {
    initTheme();

    // View switcher
    $$('.view-btn').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));

    // Filter chips
    $$('.chip').forEach(c => c.addEventListener('click', () => {
      $$('.chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
      activeFilter = c.dataset.filter;
      renderAll();
    }));

    // Drawer close
    $$('[data-close-drawer]').forEach(el => el.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('#drawer').getAttribute('aria-hidden') === 'false') closeDrawer();
    });

    renderAll();
  }

  function renderAll() {
    renderCards();
    renderMapList();
    renderTable();
    if (activeView === 'map') refreshMap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
