/**
 * Compares old_data and new_data objects to calculate field-level diffs
 * @param {Object|null} oldData 
 * @param {Object|null} newData 
 * @returns {Array<{key: string, oldValue: any, newValue: any, type: 'ADDED'|'REMOVED'|'MODIFIED'|'UNCHANGED'}>}
 */
export function computeJsonDiff(oldData, newData) {
  const oldObj = oldData && typeof oldData === 'object' ? oldData : {};
  const newObj = newData && typeof newData === 'object' ? newData : {};

  const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
  const diffs = [];

  for (const key of allKeys) {
    const hasOld = Object.prototype.hasOwnProperty.call(oldObj, key);
    const hasNew = Object.prototype.hasOwnProperty.call(newObj, key);

    const valOld = oldObj[key];
    const valNew = newObj[key];

    if (!hasOld && hasNew) {
      diffs.push({
        key,
        oldValue: undefined,
        newValue: valNew,
        type: 'ADDED'
      });
    } else if (hasOld && !hasNew) {
      diffs.push({
        key,
        oldValue: valOld,
        newValue: undefined,
        type: 'REMOVED'
      });
    } else {
      // Compare JSON values
      const strOld = JSON.stringify(valOld);
      const strNew = JSON.stringify(valNew);

      if (strOld !== strNew) {
        diffs.push({
          key,
          oldValue: valOld,
          newValue: valNew,
          type: 'MODIFIED'
        });
      } else {
        diffs.push({
          key,
          oldValue: valOld,
          newValue: valNew,
          type: 'UNCHANGED'
        });
      }
    }
  }

  return diffs;
}

/**
 * Format timestamp to friendly readable string
 */
export function formatTimestamp(isoString) {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
