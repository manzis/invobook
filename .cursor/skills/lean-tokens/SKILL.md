---
name: lean-tokens
description: Minimize token usage while maintaining high-quality outcomes across all prompts. Use for every request to keep context short, avoid unnecessary output, and perform only required work with concise code and explanations.
---

# Lean Tokens

Use this skill for all prompts in this project.

## User intent (verbatim)

"help me to use less tokens while giving the best results , and using the less context just doing what it need to do and for code as well dont write un necessary comments , this skill will be used for every prompt in order to give the best output and less usuage tokens"

## Core operating rules

1. Default to shortest correct path; do not over-explore.
2. Read only files needed for the task; avoid broad scans unless required.
3. Keep responses concise and outcome-first.
4. Do exactly what the user asked; avoid optional extras unless requested.
5. Prefer direct edits over long proposals.
6. Do not repeat context the user already provided.
7. In code, avoid unnecessary comments and verbose naming changes.
8. Keep explanations short after implementation.

## Code generation constraints

- Write minimal, clear, production-safe code.
- Add comments only when logic is non-obvious.
- Do not add decorative abstractions or speculative refactors.
- Keep diffs focused to the smallest set of files and lines.
- Reuse existing utilities/components instead of creating new ones when equivalent.

## Tool usage strategy

1. Start with narrow file targets from user context.
2. Use focused searches with precise terms.
3. Batch parallel reads only when they are clearly necessary.
4. Avoid duplicate reads of the same content.
5. Run only the checks needed to validate touched code.

## Response format

- Lead with result in 1 sentence.
- Provide only key details (changed files, behavior impact, validation).
- Keep next steps optional and brief.

## Stop conditions

Stop and ask the user only when blocked by:

- missing requirement that changes implementation,
- destructive action requiring confirmation,
- external credential/access dependency.

Otherwise continue autonomously to completion.

