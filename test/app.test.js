import { readFileSync } from 'node:fs';
import { URL as NodeURL } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

// Smoke test of the real page: index.html's markup plus js/app.js, booted the way a
// browser boots it (DOMContentLoaded), so a broken build of either shows up here.
// (node:url's URL, not the global: under jsdom the global URL is jsdom's, which
// node:fs does not accept as a file URL.)
beforeAll(async () => {
  const html = readFileSync(new NodeURL('../index.html', import.meta.url), 'utf8');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script').forEach((s) => s.remove());
  document.body.innerHTML = doc.body.innerHTML;
  localStorage.clear();
  location.hash = '';
  await import('../js/app.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
});

const app = () => document.querySelector('#app');
const waitForHash = () => new Promise((resolve) => window.addEventListener('hashchange', resolve, { once: true }));

describe('app', () => {
  it('renders the home screen in Russian by default', () => {
    expect(document.documentElement.lang).toBe('ru');
    expect(app().querySelector('h2').textContent).toBe('Руководство по 5 остеопатическим моделям ВОЗ');
  });

  it('switches the interface to English and remembers it', () => {
    document.querySelector('#langToggle').click();
    expect(document.documentElement.lang).toBe('en');
    expect(app().textContent).toContain('Welcome');
    expect(JSON.parse(localStorage.getItem('osteo5_state_v1')).lang).toBe('en');
  });

  it('lists five models with only the first one unlocked', async () => {
    const changed = waitForHash();
    window.navigate('#/models');
    await changed;
    const cards = app().querySelectorAll('.model-card');
    expect(cards).toHaveLength(5);
    expect([...cards].filter((c) => !c.classList.contains('locked'))).toHaveLength(1);
  });
});
