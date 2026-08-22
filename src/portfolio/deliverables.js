export function createDeliverable(fields) {
  return { ...fields };
}

export function prependUniqueDeliverable(items, deliverable) {
  const sourceId = deliverable.sourceId;
  if (sourceId && items.some((item) => item.sourceId === sourceId)) {
    return { items, added: false };
  }

  return { items: [deliverable, ...items], added: true };
}
