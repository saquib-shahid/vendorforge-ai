/**
 * VendorForge AI - Frontend Interactive Controller
 * Handles presets, Mastra agent execution, TabPFN analytics, multi-platform listings, and Sentry telemetry.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let presets = [];
  let selectedPreset = null;
  let customCsvContent = null;
  let currentResult = null;

  // DOM Elements
  const presetsContainer = document.getElementById('presets-container');
  const itemForm = document.getElementById('item-form');
  const runAgentBtn = document.getElementById('run-agent-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const csvUploadInput = document.getElementById('csv-upload');
  const csvStatusText = document.getElementById('csv-upload-status');
  const inspectCsvBtn = document.getElementById('inspect-csv-btn');
  const csvModal = document.getElementById('csv-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const csvTableContainer = document.getElementById('csv-table-container');
  const refreshTracesBtn = document.getElementById('refresh-traces-btn');
  const viewTracesBtn = document.getElementById('view-traces-btn');

  // Input fields
  const titleInput = document.getElementById('item-title');
  const brandInput = document.getElementById('item-brand');
  const categoryInput = document.getElementById('item-category');
  const eraInput = document.getElementById('item-era');
  const conditionSelect = document.getElementById('item-condition');
  const costInput = document.getElementById('item-cost');
  const materialsInput = document.getElementById('item-materials');
  const featuresInput = document.getElementById('item-features');

  // Stepper Elements
  const stepVector = document.getElementById('step-vector');
  const stepSerpApi = document.getElementById('step-serpapi');
  const stepTabPFN = document.getElementById('step-tabpfn');
  const stepGemma = document.getElementById('step-gemma');

  // Tab Panes
  const pricingResults = document.getElementById('pricing-results');
  const etsyResults = document.getElementById('etsy-results');
  const ebayResults = document.getElementById('ebay-results');
  const socialResults = document.getElementById('social-results');
  const audioResults = document.getElementById('audio-results');
  const tracesList = document.getElementById('traces-list');

  // Tab Buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Initialize
  loadPresets();
  setupTabNavigation();
  setupCsvHandlers();
  loadTelemetryTraces();

  // 1. Load Presets from API
  async function loadPresets() {
    try {
      const res = await fetch('/api/presets');
      if (!res.ok) throw new Error('Failed to load presets');
      presets = await res.json();
      renderPresets(presets);

      // Auto-select first preset for instant interactive demo
      if (presets.length > 0) {
        selectPreset(presets[0]);
      }
    } catch (err) {
      console.error(err);
      presetsContainer.innerHTML = '<div class="text-muted">Could not load preset items.</div>';
    }
  }

  function renderPresets(items) {
    presetsContainer.innerHTML = items.map((item, idx) => `
      <div class="preset-card ${idx === 0 ? 'active' : ''}" data-id="${item.id}">
        <img src="${item.imageUrl}" alt="${item.title}" class="preset-thumb" loading="lazy">
        <div class="preset-details">
          <div class="preset-name">${item.title}</div>
          <div class="preset-meta">${item.brand} • ${item.vintage_era || 'Vintage'}</div>
          <div class="preset-price-tag">Sourced: $${item.purchase_cost.toFixed(2)}</div>
        </div>
      </div>
    `).join('');

    // Attach click events
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const found = presets.find(p => p.id === id);
        if (found) {
          selectPreset(found);
        }
      });
    });
  }

  function selectPreset(preset) {
    selectedPreset = preset;

    // Update active UI card
    document.querySelectorAll('.preset-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-id') === preset.id);
    });

    // Populate form fields
    titleInput.value = preset.title;
    brandInput.value = preset.brand;
    categoryInput.value = preset.category;
    eraInput.value = preset.vintage_era || '';
    materialsInput.value = preset.materials || '';
    costInput.value = preset.purchase_cost || 20;
    featuresInput.value = preset.features || '';

    // Match condition dropdown
    for (let opt of conditionSelect.options) {
      if (preset.condition_grade.toLowerCase().includes(opt.value.toLowerCase().split(' ')[0])) {
        conditionSelect.value = opt.value;
        break;
      }
    }
  }

  // 2. Tab Navigation
  function setupTabNavigation() {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(target);
        if (targetPane) targetPane.classList.add('active');
      });
    });

    if (viewTracesBtn) {
      viewTracesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const telemetryTab = document.querySelector('[data-tab="tab-telemetry"]');
        if (telemetryTab) telemetryTab.click();
        const el = document.getElementById('tab-telemetry');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // 3. Custom CSV Ledger Handlers
  function setupCsvHandlers() {
    if (csvUploadInput) {
      csvUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          customCsvContent = event.target.result;
          const lineCount = customCsvContent.trim().split('\n').length - 1;
          csvStatusText.innerHTML = `✓ Active Custom Ledger: <strong>${file.name}</strong> (${lineCount} training sales loaded)`;
          showToast(`Custom ledger loaded: ${file.name}`);
        };
        reader.readAsText(file);
      });
    }

    if (inspectCsvBtn) {
      inspectCsvBtn.addEventListener('click', async () => {
        let csvText = customCsvContent;
        if (!csvText) {
          try {
            const res = await fetch('/api/dataset/sample');
            csvText = await res.text();
          } catch (e) {
            csvText = 'item_id,brand,category,condition_grade,market_comps_avg,sold_price\nVF-101,Carhartt,Workwear,Good,165,155';
          }
        }
        renderCsvTable(csvText);
        csvModal.classList.remove('hidden');
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        csvModal.classList.add('hidden');
      });
    }

    if (csvModal) {
      csvModal.addEventListener('click', (e) => {
        if (e.target === csvModal) csvModal.classList.add('hidden');
      });
    }
  }

  function renderCsvTable(csvText) {
    const lines = csvText.trim().split('\n').filter(Boolean);
    if (!lines.length) return;

    const headers = lines[0].split(',').map(h => `<th>${h.trim()}</th>`).join('');
    const rows = lines.slice(1, 15).map(line => {
      const cells = line.split(',').map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    csvTableContainer.innerHTML = `
      <table class="csv-table">
        <thead><tr>${headers}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="padding: 0.5rem; font-size: 0.7rem; color: var(--text-muted); text-align: right;">
        Showing ${Math.min(14, lines.length - 1)} of ${lines.length - 1} rows
      </div>
    `;
  }

  // 4. Run Agent Workflow
  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const itemPayload = {
      title: titleInput.value.trim(),
      brand: brandInput.value.trim(),
      category: categoryInput.value.trim(),
      vintage_era: eraInput.value.trim(),
      condition_grade: conditionSelect.value,
      purchase_cost: parseFloat(costInput.value) || 0,
      materials: materialsInput.value.trim(),
      features: featuresInput.value.trim(),
      market_comps: selectedPreset ? selectedPreset.market_comps : []
    };

    runAgentBtn.disabled = true;
    runAgentBtn.querySelector('.btn-text').textContent = 'Executing Mastra Pipeline...';

    // Reset Steppers
    resetSteppers();

    try {
      // Step 1: Vector Memory
      animateStep(stepVector, 'active', 'Querying Atlas Comps...');
      await delay(400);
      animateStep(stepVector, 'completed', 'Matches Loaded');

      // Step 2: SerpApi
      animateStep(stepSerpApi, 'active', 'Grounding Market Comps...');
      await delay(500);
      animateStep(stepSerpApi, 'completed', 'eBay & Etsy Synced');

      // Step 3: TabPFN
      animateStep(stepTabPFN, 'active', 'TabPFN-3.5 Prior Inference...');

      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: itemPayload,
          customCsv: customCsvContent
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server returned an error');
      }

      animateStep(stepTabPFN, 'completed', 'Liquidity Forecasted');

      // Step 4: Gemma 2
      animateStep(stepGemma, 'active', 'Gemma 2 Copy Synthesis...');
      const data = await response.json();
      await delay(350);
      animateStep(stepGemma, 'completed', 'Listings Generated');

      currentResult = data;

      // Populate results across all tabs
      renderPricingTab(data.tabpfn, data.item);
      renderEtsyTab(data.listings.etsy, data.tabpfn);
      renderEbayTab(data.listings.ebay, data.tabpfn);
      renderSocialTab(data.listings.shopify_instagram, data.tabpfn);
      renderAudioTab(data.narration, data.item, data.tabpfn.pricing.recommended_optimal);
      loadTelemetryTraces();

      // Enable export buttons
      copyAllBtn.disabled = false;
      exportJsonBtn.disabled = false;

      showToast('🎉 Autonomous Listing & Pricing Package Ready!');
    } catch (err) {
      console.error(err);
      showToast(`Error: ${err.message}`, true);
    } finally {
      runAgentBtn.disabled = false;
      runAgentBtn.querySelector('.btn-text').textContent = 'Execute Autonomous Reseller Agent';
    }
  });

  function resetSteppers() {
    [stepVector, stepSerpApi, stepTabPFN, stepGemma].forEach(step => {
      step.className = 'stepper-step';
      step.querySelector('.step-status').textContent = 'Standing by';
    });
  }

  function animateStep(el, state, text) {
    el.className = `stepper-step ${state}`;
    el.querySelector('.step-status').textContent = text;
  }

  function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 5. Render Output Tabs
  function renderPricingTab(pfn, item) {
    const p = pfn.pricing;
    const e = pfn.economics;
    const l = pfn.liquidity;
    const i = pfn.tabular_insights;

    pricingResults.innerHTML = `
      <div class="pricing-kpi-grid">
        <div class="kpi-card">
          <div class="kpi-badge">Quick Cashout (&lt;7 Days)</div>
          <div class="kpi-price">$${p.fast_sale_quick_liquidity}</div>
          <div class="kpi-label">Aggressive Comp Price</div>
        </div>

        <div class="kpi-card highlight">
          <div class="kpi-badge">TabPFN-3.5 Recommended</div>
          <div class="kpi-price">$${p.recommended_optimal}</div>
          <div class="kpi-label">Max Revenue Equilibrium (${i.confidence * 100}% Confidence)</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-badge">Patient Top-Dollar (30d+)</div>
          <div class="kpi-price">$${p.patient_high_margin}</div>
          <div class="kpi-label">Archive Collector Price</div>
        </div>
      </div>

      <div class="economics-breakdown">
        <div class="econ-row">
          <span>Sourced Purchase Cost:</span>
          <strong>$${e.purchase_cost.toFixed(2)}</strong>
        </div>
        <div class="econ-row">
          <span>Projected Net Profit:</span>
          <strong>+$${e.estimated_net_profit.toFixed(2)}</strong>
        </div>
        <div class="econ-row">
          <span>Return on Investment (ROI):</span>
          <span>${e.projected_roi_percent}% (${e.margin_score} Margin)</span>
        </div>
        <div class="econ-row">
          <span>Market Demand Velocity:</span>
          <span>${l.market_demand_velocity}</span>
        </div>
        <div class="econ-row">
          <span>Estimated Days on Market:</span>
          <strong>~${l.predicted_days_to_sell} days</strong>
        </div>

        <div class="velocity-bar-wrap">
          <div class="velocity-bar-label">
            <span>Probability of Sale in &lt; 14 Days (TabPFN Model):</span>
            <strong>${l.probability_sale_within_14d}%</strong>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${l.probability_sale_within_14d}%"></div>
          </div>
        </div>
      </div>

      ${i.anomaly_flag ? `
        <div class="anomaly-alert">
          <span style="font-size: 1.2rem;">⚠️</span>
          <span><strong>TabPFN Anomaly Flag:</strong> ${i.anomaly_details}</span>
        </div>
      ` : `
        <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
          Tabular priors trained across ${i.dataset_training_rows} historical sales ledger records.
        </div>
      `}
    `;
  }

  function renderEtsyTab(etsy, pfn) {
    etsyResults.innerHTML = `
      <div class="listing-box">
        <div class="listing-header-row">
          <span class="channel-tag tag-etsy">Etsy Marketplace Package</span>
          <button class="copy-field-btn" onclick="copyText('${escapeQuotes(etsy.title)}')">Copy Title</button>
        </div>

        <div class="field-label">SEO Title (Search-Weighted)</div>
        <div class="title-display">${escapeHtml(etsy.title)}</div>

        <div class="field-label" style="display:flex; justify-content:space-between; align-items:center;">
          <span>13 High-Traffic Etsy Tags</span>
          <button class="copy-field-btn" onclick="copyText('${escapeQuotes(etsy.tags_13.join(', '))}')">Copy All 13 Tags</button>
        </div>
        <div class="tags-cloud">
          ${etsy.tags_13.map(t => `<span class="tag-bubble">#${t}</span>`).join('')}
        </div>

        <div class="field-label" style="display:flex; justify-content:space-between; align-items:center; margin-top:1.2rem;">
          <span>Storytelling Description</span>
          <button class="copy-field-btn" onclick="copyText('${escapeQuotes(etsy.storytelling_description)}')">Copy Description</button>
        </div>
        <div class="content-block">${escapeHtml(etsy.storytelling_description)}</div>
      </div>
    `;
  }

  function renderEbayTab(ebay, pfn) {
    ebayResults.innerHTML = `
      <div class="listing-box">
        <div class="listing-header-row">
          <span class="channel-tag tag-ebay">eBay High-Conversion Package</span>
          <button class="copy-field-btn" onclick="copyText('${escapeQuotes(ebay.title_80char)}')">Copy Title</button>
        </div>

        <div class="field-label">80-Character Optimized Title</div>
        <div class="title-display">${escapeHtml(ebay.title_80char)}</div>
        <div class="char-counter">${ebay.title_80char.length} / 80 characters used</div>

        <div class="field-label">Item Specifics (Filter Matching)</div>
        <div class="economics-breakdown" style="padding: 0.85rem; margin-bottom: 1rem;">
          ${Object.entries(ebay.item_specifics).map(([k, v]) => `
            <div class="econ-row">
              <span style="color:var(--text-muted);">${k}:</span>
              <strong>${v}</strong>
            </div>
          `).join('')}
        </div>

        <div class="field-label">Bullet Point Description</div>
        <div class="content-block" style="max-height: 180px;">
          ${ebay.bullet_description.map(b => `• ${b}`).join('\n')}
        </div>
      </div>
    `;
  }

  function renderSocialTab(social, pfn) {
    socialResults.innerHTML = `
      <div class="listing-box">
        <div class="listing-header-row">
          <span class="channel-tag tag-social">Shopify & Instagram Reel Caption</span>
          <button class="copy-field-btn" onclick="copyText('${escapeQuotes(social.caption + '\n\n' + social.hashtags.join(' '))}')">Copy Caption</button>
        </div>

        <div class="field-label">Hook & Headline</div>
        <div class="title-display">${escapeHtml(social.headline)} — $${social.suggested_price}</div>

        <div class="field-label" style="margin-top:1rem;">Post Caption</div>
        <div class="content-block" style="max-height: 160px;">${escapeHtml(social.caption)}</div>

        <div class="field-label" style="margin-top:1rem;">Curated Niche Hashtags</div>
        <div class="tags-cloud">
          ${social.hashtags.map(h => `<span class="tag-bubble">${h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function renderAudioTab(audio, item, price) {
    audioResults.innerHTML = `
      <div class="audio-card">
        <div class="audio-header">
          <span class="tech-badge badge-sentry">
            <span class="badge-dot"></span> ${audio.voiceName}
          </span>
          <span class="badge-subtle">${audio.durationSeconds} Seconds Reel Format</span>
        </div>

        <div class="field-label" style="text-align:left;">15-Second Viral Reel Script</div>
        <div class="audio-script-box">
          "${escapeHtml(audio.script)}"
        </div>

        <div class="audio-controls">
          <button id="play-audio-btn" class="btn-primary" style="padding: 0.65rem 1.5rem; flex-direction: row; gap: 0.5rem;">
            <span>▶️ Play Reseller Voiceover</span>
          </button>
          <button class="btn-sm btn-outline" onclick="copyText('${escapeQuotes(audio.script)}')">
            📋 Copy Script
          </button>
        </div>
      </div>
    `;

    const playBtn = document.getElementById('play-audio-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (audio.audioUrl) {
          const snd = new Audio(audio.audioUrl);
          snd.play();
        } else if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(audio.script);
          utter.rate = 1.05;
          utter.pitch = 1.0;
          window.speechSynthesis.speak(utter);
          showToast('Playing synthetic voiceover narration...');
        } else {
          showToast('Audio synthesis supported via ElevenLabs API key.');
        }
      });
    }
  }

  // 6. Sentry Telemetry Traces
  async function loadTelemetryTraces() {
    try {
      const res = await fetch('/api/telemetry/traces');
      if (!res.ok) return;
      const traces = await res.json();
      renderTracesList(traces);
    } catch (e) {
      console.warn('Telemetry load failed:', e);
    }
  }

  function renderTracesList(traces) {
    if (!traces || traces.length === 0) {
      tracesList.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <div class="empty-icon">📡</div>
          <p>No agent spans recorded yet. Execute the agent above to record live telemetry.</p>
        </div>
      `;
      return;
    }

    tracesList.innerHTML = traces.slice(0, 5).map(trace => `
      <div class="trace-item">
        <div class="trace-meta-row">
          <div>
            <span class="trace-id">${trace.traceId}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">
              (${trace.metadata.itemTitle || trace.operationName})
            </span>
          </div>
          <div class="trace-duration">${trace.durationMs} ms</div>
        </div>

        <div style="display:flex; gap: 1rem; margin-bottom: 0.65rem; font-size: 0.75rem;">
          <span>Tokens: <strong>${trace.metrics.totalTokens}</strong></span>
          <span>Open-Source Cost: <strong>$0.00</strong></span>
          <span style="color: var(--emerald-400);">Saved vs Proprietary: <strong>+$${trace.metrics.openSourceSavingsUsd.toFixed(4)}</strong></span>
        </div>

        <div class="spans-tree">
          ${trace.spans.map(s => `
            <div class="span-row">
              <span>
                <span class="span-type-badge ${getSpanTypeClass(s.spanType)}">${s.spanType}</span>
                <span style="margin-left: 0.4rem;">${s.spanName}</span>
              </span>
              <span style="color: var(--text-muted);">${s.durationMs}ms</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function getSpanTypeClass(type) {
    if (type === 'llm_call') return 'type-llm';
    if (type === 'ml_inference') return 'type-ml';
    if (type === 'db_lookup') return 'type-db';
    return 'type-tool';
  }

  if (refreshTracesBtn) {
    refreshTracesBtn.addEventListener('click', () => {
      loadTelemetryTraces();
      showToast('Refreshed Sentry telemetry spans.');
    });
  }

  // 7. Global Export Actions
  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      if (!currentResult) return;
      const fullText = `=== VENDORFORGE AI RESALE PACKAGE ===
ITEM: ${currentResult.item.title}
PRICE: $${currentResult.tabpfn.pricing.recommended_optimal} (Predicted days: ~${currentResult.tabpfn.liquidity.predicted_days_to_sell})

--- ETSY ---
TITLE: ${currentResult.listings.etsy.title}
TAGS: ${currentResult.listings.etsy.tags_13.join(', ')}
DESCRIPTION:
${currentResult.listings.etsy.storytelling_description}

--- EBAY ---
TITLE: ${currentResult.listings.ebay.title_80char}
BULLETS:
${currentResult.listings.ebay.bullet_description.join('\n')}

--- INSTAGRAM / SHOPIFY ---
${currentResult.listings.shopify_instagram.headline}
${currentResult.listings.shopify_instagram.caption}
${currentResult.listings.shopify_instagram.hashtags.join(' ')}
`;
      navigator.clipboard.writeText(fullText);
      showToast('Copied full multi-channel listing package!');
    });
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      if (!currentResult) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentResult, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `vendorforge-${currentResult.item.brand.toLowerCase()}-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported JSON package.');
    });
  }

  // Helpers
  window.copyText = function(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = isError ? '#ef4444' : '#10b981';
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
  }
});
