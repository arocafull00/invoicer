---
name: replicate-ui-from-image
description: >-
  Replicate a UI from a screenshot or design image using an existing component or
  screen as structural reference. Enforces party-fun-2 theme tokens, StyleSheet
  co-location, and aggressive component extraction. Use when the user attaches an
  image and asks to match, implement, or clone an interface (replicar interfaz,
  clonar diseño, pantalla como en la imagen).
---

# Replicate UI from image

## When this applies

The user supplies at least one **image** (mock, screenshot, or reference) and optionally points to a **component or screen file** to mirror structure, navigation, or patterns.

## Non-negotiables

1. **Global styling**: Import and use tokens from `src/theme/theme.ts` only — `colors`, `spacing`, `borderRadius`, `typography`, `animation`, and `theme` for React Native Paper. Do not introduce one-off hex codes or magic numbers for spacing or radii when a token fits; add new tokens in `theme.ts` only when the design clearly requires a new semantic color or scale step used more than once.
2. **Styles location**: Use `StyleSheet.create` in a co-located `*.styles.ts` file next to the screen (same pattern as `home-screen.styles.ts`). Keep components thin: `tsx` for structure and behavior, `styles` for static layout and look.
3. **Libraries**: Follow `.agents/skills/building-native-ui/SKILL.md` — Paper `Text`/`Icon` where the app already does, `expo-image`, `react-native-safe-area-context`, kebab-case file names under `src/`, no components co-located in `app/` except route files.

## Componentization

1. **Reuse first**: Check `src/shared/components` and existing screen `components/` folders for buttons, cards, and backgrounds before duplicating.
2. **Split by responsibility**: Every visually distinct block (header, card, list section, footer actions) becomes its own file in a `components/` folder next to the screen unless it is already shared.
3. **Lists**: If you use `array.map`, the rendered row or cell **must** be a separate component in its own file (named by role, e.g. `deck-list-row.tsx`), not an inline function body inside the parent.
4. **Props**: Prefer small, explicit props; avoid boolean soup — use composition where the codebase already does.

## Workflow

1. Read the reference component or screen the user named (or the closest existing screen to the feature).
2. From the image, list hierarchy top-to-bottom: background, scroll vs fixed areas, repeated items, primary actions.
3. Map each visual element to tokens and to new or existing components.
4. Implement: route-only file under `app/` if needed; real UI under `src/screens/...` with `*.styles.ts` and `components/*.tsx`.
5. After edits, ensure imports use path aliases if the project already uses them for that folder.

## What you deliver

Working screen (and route wiring if requested) that matches the image **structurally and visually** within the app’s design system, with **no** demo-only components or placeholder data unless the user asked for placeholders.
