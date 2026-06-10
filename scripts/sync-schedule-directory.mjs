import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalDataPath = path.join(repoRoot, 'data', 'schedule-directory.json');
const psychPath = path.join(repoRoot, 'psych-scheduler.html');
const jfkCanonicalPath = path.join(repoRoot, 'vercel-jfk', 'index.html');
const jfkAliasPaths = [
  path.join(repoRoot, 'vercel-jfk', 'jfk-med-staff-schedule-experimental-v2.html'),
  path.join(repoRoot, 'vercel-jfk', 'non-clinical', 'jfk-med-staff-schedule-experimental-v2.html')
];

const PSYCH_MARKER = 'GENERATED_PSYCH_DIRECTORY_DATA';
const JFK_MARKER = 'GENERATED_JFK_DIRECTORY_DATA';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function fail(message) {
  throw new Error(message);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePhoneValue(value) {
  return String(value || '').trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function formatJsConst(name, value) {
  return `const ${name} = ${JSON.stringify(value, null, 2)};`;
}

function replaceGeneratedBlock(fileContent, marker, blockContent) {
  const begin = `// BEGIN ${marker}`;
  const end = `// END ${marker}`;
  const startIndex = fileContent.indexOf(begin);
  const endIndex = fileContent.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    fail(`Missing generated block markers for ${marker}`);
  }
  const prefix = fileContent.slice(0, startIndex + begin.length);
  const suffix = fileContent.slice(endIndex);
  return `${prefix}\n${blockContent}\n${suffix}`;
}

function parseCanonicalJson() {
  const raw = JSON.parse(readText(canonicalDataPath));
  validateCanonical(raw);
  return raw;
}

function validateCanonical(data) {
  if (!data || typeof data !== 'object') fail('Canonical directory data must be an object.');
  if (!data.meta || typeof data.meta !== 'object') fail('meta is required.');
  if (data.meta.schemaVersion !== 1) fail('schemaVersion must be 1.');
  if (!Array.isArray(data.providers) || !data.providers.length) fail('providers must be a non-empty array.');
  if (!Array.isArray(data.directorySections)) fail('directorySections must be an array.');
  if (!Array.isArray(data.otpObotDirectory)) fail('otpObotDirectory must be an array.');

  const providerIdSet = new Set();
  const providerNameSet = new Set();
  const namePhoneSet = new Set();

  for (const provider of data.providers) {
    if (!provider || typeof provider !== 'object') fail('Every provider must be an object.');
    if (!provider.id || typeof provider.id !== 'string') fail('Every provider must have an id.');
    if (providerIdSet.has(provider.id)) fail(`Duplicate provider id: ${provider.id}`);
    providerIdSet.add(provider.id);
    if (!provider.displayName || typeof provider.displayName !== 'string') fail(`Provider ${provider.id} is missing displayName.`);
    if (providerNameSet.has(provider.displayName)) fail(`Duplicate provider displayName: ${provider.displayName}`);
    providerNameSet.add(provider.displayName);
    if (!['psych', 'medical'].includes(provider.group)) fail(`Provider ${provider.displayName} has invalid group.`);
    if (!provider.primaryPhone || !normalizePhoneValue(provider.primaryPhone)) fail(`Provider ${provider.displayName} is missing primaryPhone.`);
    if (!Array.isArray(provider.alternatePhones)) fail(`Provider ${provider.displayName} alternatePhones must be an array.`);
    if (!Array.isArray(provider.matchAliases)) fail(`Provider ${provider.displayName} matchAliases must be an array.`);
    if (!provider.scheduleHeaders || typeof provider.scheduleHeaders !== 'object') fail(`Provider ${provider.displayName} is missing scheduleHeaders.`);
    for (const appKey of ['psychScheduler', 'jfkMedStaff']) {
      const appHeaders = provider.scheduleHeaders[appKey];
      if (appHeaders == null) continue;
      if (typeof appHeaders !== 'object') fail(`Provider ${provider.displayName} ${appKey} headers must be an object or null.`);
      if (!appHeaders.primary || typeof appHeaders.primary !== 'string') fail(`Provider ${provider.displayName} ${appKey} primary header is required.`);
      if (!Array.isArray(appHeaders.alternates)) fail(`Provider ${provider.displayName} ${appKey} alternates must be an array.`);
    }
    const actionPhones = getActionPhones(provider);
    if (!actionPhones.text || !actionPhones.call) fail(`Provider ${provider.displayName} is missing required quick-action phone fallback.`);
    const renderedKey = `${provider.displayName}|${provider.primaryPhone}`;
    if (namePhoneSet.has(renderedKey)) fail(`Duplicate rendered contact mapping: ${renderedKey}`);
    namePhoneSet.add(renderedKey);
  }

  const psychScheduleProviders = data.providers.filter(provider => provider.scheduleHeaders.psychScheduler);
  if (!psychScheduleProviders.length) fail('At least one psychScheduler provider mapping is required.');
  const jfkScheduleProviders = data.providers.filter(provider => provider.scheduleHeaders.jfkMedStaff);
  if (!jfkScheduleProviders.length) fail('At least one jfkMedStaff provider mapping is required.');

  for (const section of data.directorySections) {
    if (!section.id || !section.title || !Array.isArray(section.entries)) fail('Each directory section requires id, title, and entries.');
    for (const entry of section.entries) {
      if (!entry.name) fail(`Directory section ${section.id} has an entry without a name.`);
      if (entry.primaryPhone != null && typeof entry.primaryPhone !== 'string') fail(`Directory entry ${entry.name} primaryPhone must be a string when present.`);
      if (!Array.isArray(entry.alternatePhones)) fail(`Directory entry ${entry.name} alternatePhones must be an array.`);
    }
  }

  for (const item of data.otpObotDirectory) {
    if (!item.id || !item.name || !Array.isArray(item.phones)) fail('Each OTP/OBOT entry requires id, name, and phones.');
  }
}

function getActionPhones(provider) {
  const text = normalizePhoneValue(provider.textPhone || provider.primaryPhone);
  const call = normalizePhoneValue(provider.callPhone || provider.primaryPhone);
  return { text, call };
}

function buildProviderPhoneMap(providers) {
  return Object.fromEntries(
    providers
      .map(provider => [provider.displayName, normalizePhoneValue(provider.primaryPhone)])
      .sort((a, b) => a[0].localeCompare(b[0]))
  );
}

function buildActionPhoneLookup(providers) {
  return Object.fromEntries(
    providers
      .map(provider => [provider.displayName, getActionPhones(provider)])
      .sort((a, b) => a[0].localeCompare(b[0]))
  );
}

function buildPsychAliases(providers) {
  const aliasEntries = providers
    .filter(provider => provider.scheduleHeaders.psychScheduler)
    .map(provider => {
      const psychHeaders = provider.scheduleHeaders.psychScheduler;
      const aliases = unique([
        provider.displayName.toUpperCase(),
        psychHeaders.primary.toUpperCase(),
        ...(psychHeaders.alternates || []).map(alias => alias.toUpperCase()),
        ...provider.matchAliases.map(alias => alias.toUpperCase())
      ]);
      return [provider.displayName, aliases];
    })
    .sort((a, b) => a[0].localeCompare(b[0]));
  return Object.fromEntries(aliasEntries);
}

function buildPsychDirectoryProviders(providers) {
  return providers
    .map(provider => {
      const action = getActionPhones(provider);
      return {
        name: provider.displayName,
        group: provider.group,
        phone: normalizePhoneValue(provider.primaryPhone),
        textPhone: action.text,
        callPhone: action.call,
        alternatePhones: provider.alternatePhones.map(phoneEntry => typeof phoneEntry === 'string' ? { label: '', phone: phoneEntry } : phoneEntry),
        sourceLabel: provider.sourceLabel || ''
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildPsychDirectorySections(directorySections) {
  return directorySections.map(section => ({
    title: section.title,
    items: section.entries.map(entry => ({
      name: entry.name,
      phone: entry.primaryPhone || '',
      alternatePhones: entry.alternatePhones.map(phone => typeof phone === 'string' ? { label: '', phone } : phone),
      ext: entry.ext || ''
    }))
  }));
}

function buildJfkMedical(providers) {
  return providers
    .filter(provider => provider.scheduleHeaders.jfkMedStaff && provider.group === 'medical')
    .map(provider => ({
      header: provider.scheduleHeaders.jfkMedStaff.primary,
      label: provider.displayName,
      phone: normalizePhoneValue(provider.primaryPhone),
      sourceLabel: provider.scheduleHeaders.jfkMedStaff.sourceLabel || provider.sourceLabel || ''
    }));
}

function buildJfkPsych(providers) {
  return providers
    .filter(provider => provider.scheduleHeaders.jfkMedStaff && provider.group === 'psych')
    .map(provider => ({
      header: provider.scheduleHeaders.jfkMedStaff.primary,
      label: provider.displayName,
      phone: normalizePhoneValue(provider.primaryPhone),
      sourceLabel: provider.scheduleHeaders.jfkMedStaff.sourceLabel || provider.sourceLabel || ''
    }));
}

function buildJfkSections(directorySections) {
  return directorySections.map(section => ({
    title: section.title,
    items: section.entries.map(entry => ({
      name: entry.name,
      ...(entry.ext ? { ext: entry.ext } : {}),
      ...(entry.primaryPhone ? { phone: entry.primaryPhone } : {})
    }))
  }));
}

function buildOtpDirectory(items) {
  return items.map(item => ({
    name: item.name,
    phones: item.phones.slice()
  }));
}

function generatePsychBlock(data) {
  const providerPhones = buildProviderPhoneMap(data.providers);
  const providerActions = buildActionPhoneLookup(data.providers);
  const providerAliases = buildPsychAliases(data.providers);
  const directoryProviders = buildPsychDirectoryProviders(data.providers);
  const directorySections = buildPsychDirectorySections(data.directorySections);
  const otpDirectory = buildOtpDirectory(data.otpObotDirectory);
  return [
    formatJsConst('PROVIDER_PHONES', providerPhones),
    formatJsConst('PROVIDER_ACTION_PHONES', providerActions),
    formatJsConst('PROVIDER_ALIASES', providerAliases),
    formatJsConst('PSYCH_DIRECTORY_PROVIDERS', directoryProviders),
    formatJsConst('PSYCH_DIRECTORY_SECTIONS', directorySections),
    formatJsConst('OTP_OBOT_DIRECTORY', otpDirectory)
  ].join('\n\n');
}

function generateJfkBlock(data) {
  const medical = buildJfkMedical(data.providers);
  const psych = buildJfkPsych(data.providers);
  const phoneLookup = buildProviderPhoneMap(data.providers);
  const actionPhoneLookup = buildActionPhoneLookup(data.providers);
  const directorySections = buildJfkSections(data.directorySections);
  const otpDirectory = buildOtpDirectory(data.otpObotDirectory);
  return [
    formatJsConst('MEDICAL', medical),
    formatJsConst('PSYCH', psych),
    formatJsConst('PHONE', phoneLookup),
    formatJsConst('ACTION_PHONE_LOOKUP', actionPhoneLookup),
    formatJsConst('REGULAR_DIRECTORY_SECTIONS', directorySections),
    formatJsConst('OTP_OBOT_DIRECTORY', otpDirectory)
  ].join('\n\n');
}

function ensureAliasCopies(expectedCanonical) {
  for (const aliasPath of jfkAliasPaths) {
    const current = readText(aliasPath);
    if (checkOnly) {
      if (current !== expectedCanonical) fail(`${path.relative(repoRoot, aliasPath)} does not exactly match canonical vercel-jfk/index.html.`);
    } else {
      writeText(aliasPath, expectedCanonical);
    }
  }
}

function run() {
  const data = parseCanonicalJson();
  const psychSource = readText(psychPath);
  const jfkSource = readText(jfkCanonicalPath);
  const psychNext = replaceGeneratedBlock(psychSource, PSYCH_MARKER, generatePsychBlock(data));
  const jfkNext = replaceGeneratedBlock(jfkSource, JFK_MARKER, generateJfkBlock(data));

  if (checkOnly) {
    if (psychNext !== psychSource) fail('psych-scheduler.html generated directory block is stale.');
    if (jfkNext !== jfkSource) fail('vercel-jfk/index.html generated directory block is stale.');
    ensureAliasCopies(jfkNext);
    return;
  }

  writeText(psychPath, psychNext);
  writeText(jfkCanonicalPath, jfkNext);
  ensureAliasCopies(jfkNext);
}

run();
