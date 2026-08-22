function reportFeatureError(error) {
  window.setTimeout(() => { throw error; }, 0);
}

export function initializeFeature(name, initializer, reportError = reportFeatureError) {
  try {
    initializer();
    return true;
  } catch (error) {
    reportError(error, name);
    return false;
  }
}
