# Curriculum source of truth

The packaged Mandarin curriculum is intentionally deterministic. Do not generate lessons with random words or random lesson types.

## Files

- `curriculum.ts`: 150 course definitions and base AI-scenario metadata.
- `topic-blueprints.ts`: one original, practical sentence exchange for every course. Pipe separators define the chunks used by the sentence coach.
- `quality-lessons.ts`: turns every topic into a four-lesson learning arc: core expressions, sentence breakdown, real conversation, and speaking review.
- `quality-scenarios.ts`: connects each AI role-play to the relevant course exchange.
- `catalog.ts`: the only catalog imported by database sync code.

Every sentence supports a natural translation, literal breakdown, pinyin chunks, a reusable pattern, a grammar/usage note, and a related prompt or reply. Exercises cover meaning, listening, reordering, speaking, translation, and natural replies.

## Quality gate

Run:

```bash
npm run curriculum:validate
```

The validator rejects missing course coverage, duplicate slugs, duplicate lesson fingerprints, cross-course sentence reuse, generic titles/descriptions, placeholder translations, sentence fragments, weak lesson depth, duplicate exercises, and duplicate AI scenarios. It runs automatically before build and seed.

## Publishing

After deployment, run `npm run seed` with the live MongoDB environment or use **Sync Curriculum** in the admin panel. Sync removes stale records only when `source` is `packaged`; admin-created content is preserved.
