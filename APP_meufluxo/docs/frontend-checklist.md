# Frontend Checklist

Before implementing any frontend task, verify:

## Context
- Did I read the shared frontend rules?
- Did I read the UX rules?
- Did I check project decisions and known bugs?
- Did I verify the real backend contract?

## Reuse
- Is there already a similar component?
- Can this be solved by extending an existing component?
- Am I duplicating visual or behavioral logic?

## UX
- Does the screen have loading state?
- Does the screen have empty state?
- Does the screen have error state?
- Are actions clear and predictable?
- Is delete protected by confirmation?
- Is create/edit using modal when appropriate?

## API
- Are pagination params correct?
- Is sorting format correct?
- Am I respecting field names and response shape?
- Am I avoiding assumptions not confirmed in code?

## Scope
- Am I making only the requested change?
- Am I avoiding unnecessary refactors?
- Are future improvements separated from current delivery?

## Final review
- Are impacted files clear?
- Is the code consistent with existing patterns?
- Is the UI consistent with the rest of the app?
- Is the change easy to review and commit?