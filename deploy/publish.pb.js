/// <reference path="../pb_data/types.d.ts" />
//
// Publish pipeline: exports items / konst / aktorer collections to
// public/data/items-combined.json in the GitHub repo, triggering deploy.yml.
//
// Endpoint:  POST /api/publish/items-json
// Auth:      requires any logged-in PB user (admin or aktör)
// Env vars:  GITHUB_PAT          fine-grained PAT with Contents: write
//            GITHUB_REPO         owner/repo  (default: wilmajohnsson-lab/huddinge-karta)
//            GITHUB_BRANCH       branch name (default: main)
//            GITHUB_FILE_PATH    file path   (default: public/data/items-combined.json)
//
// Output shape: { events[], konst[], aktorer[], orgs[], areas[] }
// On success: { ok, commit, events_count, konst_count, aktorer_count }
// On failure: 4xx/5xx with { message }

routerAdd('POST', '/api/publish/items-json', (e) => {
  // ── 1. Auth ──────────────────────────────────────────────────────────
  if (!e.auth) {
    throw new ApiError(401, 'Inloggning krävs');
  }

  // ── 2. Config ────────────────────────────────────────────────────────
  const pat    = $os.getenv('GITHUB_PAT');
  const repo   = $os.getenv('GITHUB_REPO')      || 'wilmajohnsson-lab/huddinge-karta';
  const branch = $os.getenv('GITHUB_BRANCH')    || 'main';
  const ghPath = $os.getenv('GITHUB_FILE_PATH') || 'public/data/items-combined.json';
  if (!pat) {
    throw new ApiError(500, 'GITHUB_PAT är inte konfigurerad i pocketbase.service');
  }

  const HTML_FORBIDDEN = /[<>]/;

  // ── 3a. Read items (→ events) ─────────────────────────────────────────
  const itemRecords = arrayOf(new Record);
  e.app.recordQuery('items')
    .orderBy('legacy_id ASC')
    .all(itemRecords);

  const REG_OUT = { 'yes': true, 'no': false, 'unknown': null };
  const events = [];
  for (let i = 0; i < itemRecords.length; i++) {
    const r = itemRecords[i];
    events.push({
      id:           r.get('legacy_id') || (i + 1),
      cat:          r.get('cat'),
      name:         r.get('name'),
      desc:         r.get('desc')     || '',
      longDesc:     r.get('longDesc') || '',
      date:         r.get('date')     || '',
      time:         r.get('time')     || '',
      loc:          r.get('loc')      || '',
      addr:         r.get('addr')     || '',
      host:         r.get('host')     || '',
      area:         r.get('area')     || '',
      free:         !!r.get('free'),
      pris:         (r.get('pris') === '' || r.get('pris') == null) ? null : r.get('pris'),
      registration: REG_OUT[r.get('registration')] !== undefined ? REG_OUT[r.get('registration')] : null,
      cta:          r.get('cta')      || null,
      cta_url:      r.get('cta_url') || null,
      img:          r.get('img')      || '',
      url:          r.get('url')      || '',
      lat:          r.get('lat')      || 0,
      lng:          r.get('lng')      || 0,
    });
  }

  // ── 3b. Read konst ────────────────────────────────────────────────────
  const konstRecords = arrayOf(new Record);
  try {
    e.app.recordQuery('konst')
      .orderBy('name ASC')
      .all(konstRecords);
  } catch (_err) {
    // collection may be empty or missing — treat as empty
  }

  const konst = [];
  for (let i = 0; i < konstRecords.length; i++) {
    const r = konstRecords[i];
    konst.push({
      id:       r.id || ('konst-' + i),
      cat:      'konst',
      name:     r.get('name')     || '',
      artist:   r.get('artist')   || '',
      year:     r.get('year')     || '',
      loc:      r.get('loc')      || '',
      desc:     r.get('desc')     || '',
      area:     r.get('area')     || '',
      img:      r.get('img')      || '',
      lat:      r.get('lat')      || 0,
      lng:      r.get('lng')      || 0,
      longDesc: r.get('longDesc') || '',
    });
  }

  // ── 3c. Read aktorer ──────────────────────────────────────────────────
  const aktorRecords = arrayOf(new Record);
  try {
    e.app.recordQuery('aktorer')
      .orderBy('name ASC')
      .all(aktorRecords);
  } catch (_err) {
    // collection may be empty or missing — treat as empty
  }

  const aktorer = [];
  for (let i = 0; i < aktorRecords.length; i++) {
    const r = aktorRecords[i];
    aktorer.push({
      id:   r.id || ('aktor-' + i),
      cat:  'plats',
      type: r.get('type') || '',
      name: r.get('name') || '',
      org:  r.get('org')  || '',
      area: r.get('area') || '',
      addr: r.get('addr') || '',
      img:  r.get('img')  || '',
      lat:  r.get('lat')  || 0,
      lng:  r.get('lng')  || 0,
      url:  r.get('url')  || '',
    });
  }

  // ── 4. Require at least some data ─────────────────────────────────────
  if (events.length === 0 && konst.length === 0 && aktorer.length === 0) {
    throw new ApiError(400, 'Alla tre samlingar är tomma — inget att publicera');
  }

  // ── 5. Inline validation (mirrors validate-items.mjs) ────────────────
  const TEXT_CHECK = ['name','desc','loc','addr','longDesc','host','date','time','artist','year','org'];
  const errors = [];

  for (const it of events) {
    for (const f of TEXT_CHECK) {
      if (typeof it[f] === 'string' && HTML_FORBIDDEN.test(it[f])) {
        errors.push('events id=' + it.id + ' fält "' + f + '" innehåller < eller >');
      }
    }
  }
  for (const it of konst) {
    for (const f of TEXT_CHECK) {
      if (typeof it[f] === 'string' && HTML_FORBIDDEN.test(it[f])) {
        errors.push('konst id=' + it.id + ' fält "' + f + '" innehåller < eller >');
      }
    }
  }
  for (const it of aktorer) {
    for (const f of TEXT_CHECK) {
      if (typeof it[f] === 'string' && HTML_FORBIDDEN.test(it[f])) {
        errors.push('aktorer id=' + it.id + ' fält "' + f + '" innehåller < eller >');
      }
    }
  }
  if (errors.length > 0) {
    throw new ApiError(422, 'Validering misslyckades: ' + errors.slice(0, 10).join('; '));
  }

  // ── 6. Build orgs + areas + payload ──────────────────────────────────
  const orgsSet  = {};
  const areasSet = {};

  for (const it of events) {
    if (it.host)  orgsSet[it.host]   = true;
    if (it.area)  areasSet[it.area]  = true;
  }
  for (const it of konst) {
    if (it.artist) orgsSet[it.artist] = true;
    if (it.area)   areasSet[it.area]  = true;
  }
  for (const it of aktorer) {
    if (it.org)  orgsSet[it.org]   = true;
    if (it.area) areasSet[it.area] = true;
  }

  const orgs  = Object.keys(orgsSet).sort();
  const areas = Object.keys(areasSet).sort();

  const payload = { events, konst, aktorer, orgs, areas };
  const json    = JSON.stringify(payload, null, 2) + '\n';

  // ── 7. Base64 encode (inline, no Buffer/btoa in Goja) ────────────────
  const b64 = (function(str) {
    var u = unescape(encodeURIComponent(str));
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var o = '';
    for (var i = 0; i < u.length; i += 3) {
      var a = u.charCodeAt(i),
          b = i + 1 < u.length ? u.charCodeAt(i + 1) : NaN,
          d = i + 2 < u.length ? u.charCodeAt(i + 2) : NaN;
      var t1 = a >> 2,
          t2 = ((a & 3) << 4) | (isNaN(b) ? 0 : (b >> 4)),
          t3 = isNaN(b) ? 64 : (((b & 15) << 2) | (isNaN(d) ? 0 : (d >> 6))),
          t4 = isNaN(d) ? 64 : (d & 63);
      o += c[t1] + c[t2] + (t3 === 64 ? '=' : c[t3]) + (t4 === 64 ? '=' : c[t4]);
    }
    return o;
  })(json);

  // ── 8. Get current file SHA from GitHub ───────────────────────────────
  const ghBase = 'https://api.github.com/repos/' + repo + '/contents/' + encodeURI(ghPath);
  const ghHeaders = {
    'Authorization':        'Bearer ' + pat,
    'Accept':               'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent':           'huddinge-admin-publish/2.0',
  };

  let currentSha = null;
  try {
    const cur = $http.send({
      url:     ghBase + '?ref=' + encodeURIComponent(branch),
      method:  'GET',
      headers: ghHeaders,
      timeout: 20,
    });
    if (cur.statusCode === 200) {
      currentSha = JSON.parse(cur.raw).sha;
    } else if (cur.statusCode !== 404) {
      throw new ApiError(502, 'GitHub GET misslyckades: ' + cur.statusCode + ' ' + cur.raw.substring(0, 200));
    }
  } catch (err) {
    if (err.message && err.message.indexOf('GitHub GET') === 0) throw err;
    throw new ApiError(502, 'GitHub-anrop misslyckades: ' + (err.message || err));
  }

  // ── 9. PUT new content ────────────────────────────────────────────────
  const putBody = {
    message: 'chore(data): publish from huddinge-admin (' + (e.auth.get('email') || e.auth.id) + ')',
    content: b64,
    branch:  branch,
  };
  if (currentSha) putBody.sha = currentSha;

  const put = $http.send({
    url:     ghBase,
    method:  'PUT',
    headers: ghHeaders,
    body:    JSON.stringify(putBody),
    timeout: 30,
  });
  if (put.statusCode < 200 || put.statusCode >= 300) {
    throw new ApiError(502, 'GitHub PUT misslyckades: ' + put.statusCode + ' ' + put.raw.substring(0, 300));
  }
  const commitSha = JSON.parse(put.raw).commit.sha;

  // ── 10. Done ──────────────────────────────────────────────────────────
  return e.json(200, {
    ok:            true,
    commit:        commitSha,
    events_count:  events.length,
    konst_count:   konst.length,
    aktorer_count: aktorer.length,
    orgs_count:    orgs.length,
    areas_count:   areas.length,
    published_by:  e.auth.get('email') || e.auth.id,
  });
});
