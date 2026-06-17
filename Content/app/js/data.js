/*
 * Loads a topic's animation data.
 *  1. window.CARE_ANIMATIONS bundle  → works on file:// (double-click, no server)
 *  2. fetch the canonical JSON       → only when served over http(s)
 */
(function (global) {
  const DEFAULT_TOPIC = 'topic-26-infection-control';

  async function loadTopic(key) {
    const topicKey = key || DEFAULT_TOPIC;

    const bundle = global.CARE_ANIMATIONS || {};
    if (bundle[topicKey]) return bundle[topicKey];

    if (location.protocol !== 'file:') {
      const res = await fetch('../animations/' + topicKey + '.json');
      if (res.ok) return res.json();
    }

    throw new Error('Animation "' + topicKey + '" not found. Open via the data bundle, or run a local server.');
  }

  global.loadTopic = loadTopic;
  global.DEFAULT_TOPIC = DEFAULT_TOPIC;
})(window);
