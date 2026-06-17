/*
 * GENERATED data bundle — do not hand-edit.
 * Source of truth: content/animations/topic-*.json
 *
 * Assigns a global so the player works on file:// with zero server / zero CORS
 * (fetch() of local JSON is blocked on file://). When the app is served over
 * http(s), js/data.js can fetch the canonical JSON instead.
 *
 * To add more topics later: paste each topic-XX.json here, keyed by its filename stem.
 */
window.CARE_ANIMATIONS = {
  "topic-26-infection-control": {
    "id": 26,
    "slug": "infection-control",
    "title": "Hand hygiene — the six-step handwash",
    "durationSeconds": 60,
    "source": "HC17 Infection Control Policy and Procedure (WHO six-step technique)",
    "lottieSuggestion": "hand washing, soap, hand hygiene",
    "steps": [
      { "label": "Wet hands, apply soap", "caption": "Wet your hands under warm running water and add liquid soap." },
      { "label": "Rub palm to palm", "caption": "Rub your palms together." },
      { "label": "Backs of both hands", "caption": "Rub each palm over the back of the other hand." },
      { "label": "Fingers interlaced", "caption": "Rub palm to palm with your fingers interlaced." },
      { "label": "Backs of the fingers", "caption": "Rub the backs of your fingers against the opposite palm." },
      { "label": "Clean thumbs and fingertips", "caption": "Rub around each thumb, then rub your fingertips into each palm." },
      { "label": "Rinse and dry", "caption": "Rinse under running water and dry with a paper towel." }
    ],
    "endFrame": "Wash for 40 to 60 seconds — about singing Happy Birthday twice."
  }
};
