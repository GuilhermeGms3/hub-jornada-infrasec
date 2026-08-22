const { ABSENT } = require('../fixtures/storage-fixtures');

async function openWithStorage(page, storage, hash = '') {
  await page.goto('/__blank.html');
  await page.evaluate(({ entries, absentMarker }) => {
    localStorage.clear();
    for (const [key, value] of entries) {
      if (value !== absentMarker) localStorage.setItem(key, value);
    }
  }, {
    entries: Object.entries(storage).map(([key, value]) => [key, value === ABSENT ? '__ABSENT__' : value]),
    absentMarker: '__ABSENT__'
  });
  await page.goto(`/hub-estudos-infrasec.html${hash}`);
  await page.waitForLoadState('domcontentloaded');
}

async function storageSnapshot(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((key) => [key, localStorage.getItem(key)])));
}

async function readJson(page, key, fallback = null) {
  return page.evaluate(({ storageKey, defaultValue }) => {
    const value = localStorage.getItem(storageKey);
    return value == null ? defaultValue : JSON.parse(value);
  }, { storageKey: key, defaultValue: fallback });
}

async function competencyLevels(page) {
  return page.evaluate(() => Object.fromEntries(Object.keys(window.InfraSecAdaptive.domains).map((domain) => [domain, window.InfraSecAdaptive.competency(domain).level])));
}

async function answerCurrentExam(page, correctIndexes) {
  for (const correctIndex of correctIndexes) {
    await page.locator(`#masteryOptions input[value="${correctIndex}"]`).check();
    await page.locator('#masteryNext').click();
  }
}

module.exports = { openWithStorage, storageSnapshot, readJson, competencyLevels, answerCurrentExam };
