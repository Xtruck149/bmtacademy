#!/usr/bin/env node
// Met à jour les <lastmod> de sitemap.xml avec la date du dernier commit de chaque page.
// Pourquoi : Google utilise <lastmod> pour décider quelles pages recrawler en priorité ;
// une date figée (ex. 2025-01-01) lui fait ignorer les mises à jour.
// À lancer avant un commit de contenu : npm run sitemap:dates
// (les pages modifiées mais pas encore commitées prennent la date du jour).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SITE = 'https://xtruck149.github.io/bmtacademy/';
const today = new Date().toISOString().slice(0, 10);
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const dirty = new Set(git('status', '--porcelain').split('\n').filter(Boolean).map((l) => l.slice(3)));

let changed = 0;
const xml = readFileSync('sitemap.xml', 'utf8').replace(
  /(<loc>([^<]+)<\/loc>\s*<lastmod>)([^<]*)(<\/lastmod>)/g,
  (all, head, loc, old, tail) => {
    let file = loc.slice(SITE.length) || 'index.html';
    if (file.endsWith('/')) file += 'index.html';
    const date = dirty.has(file) ? today : (git('log', '-1', '--format=%cs', '--', file) || old);
    if (date !== old) changed++;
    return head + date + tail;
  },
);
writeFileSync('sitemap.xml', xml);
console.log(`✔ sitemap.xml : ${changed} date(s) mise(s) à jour`);
