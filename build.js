#!/usr/bin/env node
/**
 * Competitive landing page builder
 * Usage: node build.js <competitor-folder-name>
 * Example: node build.js gong
 *
 * Reads:  competitors/<name>/config.json
 * Reads:  template.html
 * Writes: competitors/<name>/index.html
 * Copies: index.html  (what Vercel serves)
 */

const fs = require('fs');
const path = require('path');

const competitorName = process.argv[2];
if (!competitorName) {
  console.error('Usage: node build.js <competitor-folder-name>');
  process.exit(1);
}

const configPath = path.join(__dirname, 'competitors', competitorName, 'config.json');
const templatePath = path.join(__dirname, 'template.html');
const outputPath = path.join(__dirname, 'competitors', competitorName, 'index.html');
const rootOutputPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(configPath)) {
  console.error(`Config not found: ${configPath}`);
  process.exit(1);
}
if (!fs.existsSync(templatePath)) {
  console.error(`template.html not found`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let html = fs.readFileSync(templatePath, 'utf8');

// ── Testimonials ────────────────────────────────────────────────────────────
function buildTestimonials(testimonials) {
  const cards = testimonials.map(t => `
          <div class="quote-card">
            <span class="quote-mark">"</span>
            <p class="quote-text">${t.text}</p>
            <div class="quote-author">
              <div class="quote-avatar"><img src="attention-icon-color.png" style="width:100%;height:100%;border-radius:inherit;object-fit:cover;" alt=""></div>
              <div><div class="quote-name">${t.name}</div><div class="quote-role">${t.role}</div></div>
            </div>
          </div>`).join('\n');

  const dots = testimonials.map((_, i) =>
    `<div class="dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`
  ).join('\n          ');

  return { cards, dots };
}

// ── Comparison section ───────────────────────────────────────────────────────
function buildPainQuotes(quotes) {
  return quotes.map(q =>
    `              <div class="pq"><p class="pq-text">"${q.text}"</p><p class="pq-attr">${q.attr}</p></div>`
  ).join('\n');
}

function buildComparisonSection(config) {
  if (!config.comparison || !config.comparison.enabled) return '';

  const { headline, subHeadline, sourceNote, categories, competitorLogoSvgForHeader } = config.comparison;
  const competitor = config.competitor;

  // Competitor logo for comparison header — use wordmarkHtml if no separate header logo
  const headerLogo = competitorLogoSvgForHeader
    ? `<svg viewBox="0 0 171.3 60" style="height:26px;width:auto;" fill="white">${competitorLogoSvgForHeader}</svg>`
    : `<span style="font-size:18px;font-weight:800;letter-spacing:-0.5px;color:white;">${competitor.name}</span>`;

  // Pain summaries (competitor side)
  const painSummaries = categories.map((cat, i) => `
            <div class="pain-summary${i === 0 ? ' active' : ''}" data-cat="${i}">
              <p class="ai-summary-verdict">${cat.competitorSummary.verdict}</p>
              <p class="ai-summary-text">${cat.competitorSummary.text}</p>
            </div>`).join('');

  // Attn summaries
  const attnSummaries = categories.map((cat, i) => `
            <div class="attn-summary${i === 0 ? ' active' : ''}" data-cat="${i}">
              <p class="ai-summary-verdict">${cat.attentionSummary.verdict}</p>
              <p class="ai-summary-text">${cat.attentionSummary.text}</p>
            </div>`).join('');

  // Nav items
  const painNavItems = categories.map((cat, i) =>
    `<div class="pain-nav-item${i === 0 ? ' active' : ''}" data-cat="${i}">${cat.label}</div>`
  ).join('\n            ');

  const attnNavItems = categories.map((cat, i) =>
    `<div class="attn-nav-item${i === 0 ? ' active' : ''}" data-cat="${i}">${cat.label}</div>`
  ).join('\n            ');

  // Quote blocks
  const painCategories = categories.map((cat, i) => `
            <div class="pain-category${i === 0 ? ' active' : ''}" data-cat="${i}">
${buildPainQuotes(cat.competitorQuotes)}
            </div>`).join('');

  const attnCategories = categories.map((cat, i) => `
            <div class="attn-category${i === 0 ? ' active' : ''}" data-cat="${i}">
${buildPainQuotes(cat.attentionQuotes)}
            </div>`).join('');

  return `
  <!-- ─── COMPARISON SECTION ─── -->
  <section id="comparison">
    <div class="container">
      <p class="section-label fade-in">PAINS &amp; GAINS FROM REAL USERS</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.32);margin-top:0;margin-bottom:20px;">${sourceNote}</p>
      <h2 class="section-title fade-in fade-in-delay-1">${headline}<br><span class="grad-text">${subHeadline}</h2>

      <div class="compare-box fade-in fade-in-delay-2">
        <div class="compare-box-inner">

        <!-- Competitor side -->
        <div class="compare-gong">
          <div class="pain-header">
            <div class="header-wordmark">${headerLogo}</div>
            ${painSummaries}
          </div>
          <div class="pain-body">
          <div class="pain-nav">
            ${painNavItems}
          </div>
          <div class="pain-quotes">
            ${painCategories}
          </div>
          </div>
        </div>

        <!-- VS divider -->
        <div class="compare-vs"><div class="compare-vs-badge">vs</div></div>

        <!-- Attention side -->
        <div class="compare-attn">
          <div class="attn-header">
            <div class="header-wordmark" style="gap:8px;font-size:16px;font-weight:700;letter-spacing:-0.3px;">
              <img src="attention-icon-color.png" style="width:24px;height:24px;border-radius:6px;object-fit:cover;flex-shrink:0;" alt="Attention">
              Attention
            </div>
            ${attnSummaries}
          </div>
          <div class="attn-body">
          <div class="attn-quotes">
            ${attnCategories}
          </div>
          <div class="attn-nav">
            ${attnNavItems}
          </div>
          </div>
        </div>

        </div>
        <div class="compare-source-footer"><span class="footer-badge-grad">✦ Sourced by Attention's Super Agent in under 10 minutes · 400+ customer calls · G2 reviews noted separately</span></div>
      </div>
    </div>
  </section>`;
}

// ── FAQ JSON-LD ──────────────────────────────────────────────────────────────
function buildFaqJsonLd(faq, competitor, slug) {
  const items = faq.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer }
  }));
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items }, null, 2);
}

function buildSoftwareAppJsonLd(competitor) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Attention',
    url: 'https://www.attention.com',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: `Attention is an AI-native revenue intelligence platform — a modern alternative to ${competitor.name} that automates CRM data entry, delivers accurate sales forecasting, and provides real-time coaching.`,
    offers: { '@type': 'Offer', description: 'One subscription, no modular add-ons, free listener seats.' },
    featureList: [
      'Automated CRM data entry (saves 20–30 minutes per call)',
      'AI-native semantic call analysis',
      'Sales forecasting with 5% margin of error',
      'Real-time rep coaching',
      '200+ integrations including Salesforce, HubSpot, and Slack',
      'Public API and MCP server',
      'Free listener seats'
    ],
    sameAs: ['https://www.linkedin.com/company/attentionai', 'https://twitter.com/attention_ai']
  }, null, 2);
}

// ── Apply substitutions ──────────────────────────────────────────────────────
const { cards: testimonialsHtml, dots: testimonialsDots } = buildTestimonials(config.testimonials);
const comparisonHtml = buildComparisonSection(config);
const faqJsonLd = buildFaqJsonLd(config.faq, config.competitor, config.slug);
const softwareAppJsonLd = buildSoftwareAppJsonLd(config.competitor);

const canonicalUrl = `https://with.attention.com/${config.slug}`;

const replacements = {
  '%%PAGE_TITLE%%': config.page.title,
  '%%META_DESCRIPTION%%': config.page.description,
  '%%CANONICAL_URL%%': canonicalUrl,
  '%%OG_IMAGE%%': config.page.ogImage,
  '%%COMPETITOR_NAME%%': config.competitor.name,
  '%%COMPETITOR_COLOR%%': config.competitor.color,
  '%%COMPETITOR_COLOR_BG%%': config.competitor.colorBg,
  '%%HERO_EYEBROW%%': config.hero.eyebrow,
  '%%HERO_HEADLINE_PRE%%': config.hero.headlinePre || 'The',
  '%%HERO_HEADLINE_ANNOT_LABEL%%': config.hero.headlineAnnotLabel || 'better',
  '%%HERO_HEADLINE_POST%%': config.hero.headlinePost || 'alternative',
  '%%HERO_HEADLINE_SUB%%': config.hero.headlineSub,
  '%%HERO_WORDMARK_HTML%%': config.competitor.wordmarkHtml || `<span style="font-style:italic;opacity:0.6;">${config.competitor.name}</span>`,
  '%%HERO_SUB%%': config.hero.sub,
  '%%TESTIMONIALS_HTML%%': testimonialsHtml,
  '%%TESTIMONIALS_DOTS%%': testimonialsDots,
  '%%COMPARISON_SECTION%%': comparisonHtml,
  '%%FAQ_JSON_LD%%': faqJsonLd,
  '%%SOFTWARE_APP_JSON_LD%%': softwareAppJsonLd,
  '%%SLUG%%': config.slug,
};

for (const [token, value] of Object.entries(replacements)) {
  html = html.split(token).join(value);
}

fs.writeFileSync(outputPath, html);
fs.writeFileSync(rootOutputPath, html);

console.log(`Built: ${outputPath}`);
console.log(`Copied to: ${rootOutputPath}`);
console.log(`Page: https://with.attention.com/${config.slug}`);
