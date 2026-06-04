# pptyping development rules

- Look at the list of md files in design/ these are the design docs.
- Read the design docs that are relevant to your code changes.
- Design docs MUST be kept in sync with the code. If they drift apart, then the
  user should choose if to fix the design doc or the code.
- When making a design decision in code (ordering, thresholds,
  UX behavior, etc.), capture the _why_ — either as a short comment at
  the decision site, or in the relevant design doc. The goal is that a future
  reader can consider design intent when modifying the code.
