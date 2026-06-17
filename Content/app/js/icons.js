/*
 * Inline line icons (Tabler-style), embedded so the player renders fully offline / on file://.
 * Each value is SVG markup; resolveStepIcon() picks one per step by keyword so the
 * resolver also works for the other topics added later.
 */
(function (global) {
  const svg = (inner) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    inner + '</svg>';

  const ICONS = {
    droplet: svg('<path d="M12 3.5s-6 6.5-6 10.5a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5z"/>'),
    hand: svg(
      '<path d="M7 11V8a1.5 1.5 0 0 1 3 0v2"/>' +
      '<path d="M10 10V6a1.5 1.5 0 0 1 3 0v4"/>' +
      '<path d="M13 10V7a1.5 1.5 0 0 1 3 0v3"/>' +
      '<path d="M16 10.5V9a1.5 1.5 0 0 1 3 .3c0 5-2 9.7-6 9.7-2 0-3.2-.6-4.5-2L6 13a1.5 1.5 0 0 1 2.3-1.9L9.5 12"/>'
    ),
    interlace: svg('<rect x="3.5" y="9" width="10" height="6" rx="3"/><rect x="10.5" y="9" width="10" height="6" rx="3"/>'),
    sparkles: svg(
      '<path d="M11 4l1.3 3.4L15.7 8.7l-3.4 1.3L11 13.4 9.7 10 6.3 8.7l3.4-1.3z"/>' +
      '<path d="M17.5 13l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z"/>'
    ),
    wind: svg('<path d="M4 9h9a2.5 2.5 0 1 0-2.5-2.5"/><path d="M4 13h13a2.5 2.5 0 1 1-2.5 2.5"/><path d="M4 17h6"/>'),
    check: svg('<path d="M5 12l5 5L19 7"/>')
  };

  // Ordered keyword rules. First match (on label, then caption) wins.
  const RULES = [
    [/rinse|dry|towel|wind/i, 'wind'],
    [/interlac|link|between/i, 'interlace'],
    [/thumb|fingertip|nail|clean|sparkl/i, 'sparkles'],
    [/wet|water|soap|lather|droplet/i, 'droplet'],
    [/palm|back of|backs of|hand|rub|finger/i, 'hand'],
    [/sign|record|label|confirm|complete|check/i, 'check']
  ];

  function resolveStepIcon(step) {
    if (step && step.icon && ICONS[step.icon]) return ICONS[step.icon];
    const hay = ((step && step.label) || '') + '  ' + ((step && step.caption) || '');
    for (let i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(hay)) return ICONS[RULES[i][1]];
    }
    return null; // caller falls back to the number badge
  }

  global.CARE_ICONS = ICONS;
  global.resolveStepIcon = resolveStepIcon;
})(window);
