# Midnight Navy + Muted Slate

An optional reusable theme preset inspired by the Patchwise design iteration. It is a product-specific choice, not a universal house style. Use the rubric even when this palette is inappropriate.

## Visual intent

- Very dark navy shell with a quiet blue-violet undertone.
- Muted slate selected/detail surfaces, never a bright frost or pure white inspector.
- Compact, usable navigation and dense, readable lists.
- A single subdued navy-to-purple accent gradient; solid canvas behind main content.
- Soft off-white text and lavender focus / active states. Real imagery can supply occasional saturation.

## Exact starting tokens

```css
:root {
  color-scheme: dark;
  --pw-canvas: #090E1A;
  --pw-sidebar: #0C1222;
  --pw-surface: #141C2D;
  --pw-surface-selected: #2D3655;
  --pw-inspector: #202B40;
  --pw-border: #394760;
  --pw-border-selected: #6474AD;
  --pw-text: #E4EAF7;
  --pw-text-secondary: #ADBBD2;
  --pw-text-label: #97A9C7;
  --pw-accent: #A1AFE1;
  --pw-accent-strong: #A5ADFF;
  --pw-gradient: linear-gradient(90deg, #152E52 0%, #2A285B 55%, #432B61 100%);
  --pw-radius-control: 6px;
  --pw-radius-panel: 8px;
  --pw-sidebar-width: 184px;
  --pw-header-height: 52px;
}
```

Do not assume these color combinations pass every WCAG contrast requirement. Check actual text size, state, background, and disabled/focus treatments before release. Increase contrast where needed, especially subdued labels.

## Density and layout defaults

| Element | Starting point |
| --- | --- |
| Desktop sidebar | 176-192px, with icons plus concise labels |
| Top bar | 48-52px, quiet dividers |
| Dense desktop list | 38-42px rows, with adequate individual control targets |
| Main heading | 22-28px, not a billboard hero |
| Standard UI text | Around 13-14px; adjust for readability and content |
| Secondary metadata | Usually 12px; ensure contrast and not essential-only |
| Main page gutter | 20-32px on desktop, 16px on mobile |
| Panel corner radius | 6-8px; smaller for compact controls |
| Spacing scale | 4, 8, 12, 16, 24, 32px |
| Touch targets | Aim for around 44px where touch interaction is expected |

Do not cram a 38px mouse-oriented list into a touch-first view. Prefer a separate responsive row treatment.

## Composition

1. The dark shell establishes hierarchy with a clearly selected navigation item.
2. A content heading and small contextual toolbar lead into real data immediately.
3. A scan-friendly primary list or grid occupies most of the workspace.
4. Optional inspector appears at the right on wide screens; on mobile it becomes an accessible sheet.
5. One thin accent gradient can signal identity at the top edge; gradients should not bleed behind data rows.
6. Keep the inspector at #202B40 with near-white headings and muted labels. Do not replace it with #E8EDF5 or large light blocks unless the user explicitly requests a light-mode concept.

## Real interaction checks

- Show selection with background, border or indicator, and text, not hue alone.
- Prefer a compact row layout for data-dense screens; offer grid view when artwork helps discovery.
- Use contextual detail rather than a full-screen navigation detour when practical.
- For source-linked claims, show the exact evidence or clearly state a coverage gap.
- All icons, filters, and visual statuses must have real accessible meaning.

## Design variants

Keep the midnight shell only when it suits the project. Other projects may change palette, density, typography, or overall composition. The enduring preferences are purpose-built hierarchy, originality, careful spacing, and verified usability.
