# Navigation Design — Settings & Mobile "More" Drawer

## Decision summary

Add a **Settings** entry point to the navigation that will grow into a full settings page (initially hosting CSV import, later more actions). The entry point must be persistent and accessible on all screens.

## Desktop sidebar

- Settings item pinned at the **bottom** of the sidebar, visually separated from the main nav list (VS Code / Linear pattern).
- Clicking navigates to `/settings` (a proper page, not a modal-only surface).
- The sidebar already supports a collapsed/icon-only state — Settings must render correctly in both states (icon only when collapsed, icon + label when expanded).

## Mobile navigation — "More" drawer pattern

### Why a drawer instead of a 6th tab

The bottom tab bar already has 5 items. Adding a 6th overflows the space. Rather than shrink all tabs or scroll the bar, the design limits visible tabs to **3–4 items max** and exposes the rest through a "More" button.

### Tab bar rules

| Slot | Content |
|------|---------|
| 1st | **Home** — always visible, always in first position |
| 2nd–3rd | The **1–2 most recently visited pages** (dynamic, based on navigation history) |
| Last | **More** button (e.g. `···` or a grid icon) — always visible, always last |

- If the current page is not already in slots 2–3, it replaces the least-recently-visited slot.
- Home never gets displaced regardless of navigation history.

### "More" drawer

- Opens as a **bottom sheet** (slides up from the bottom edge).
- Contains all nav items not currently visible in the tab bar, plus Settings and any future global actions.
- **Dismissal:** tap outside the drawer, tap the More button again, or swipe down.
- Swipe-to-dismiss is a **supplemental gesture only** — a visible close button (×) or a drag handle must always be present for users who do not use gestures. Gestures are never the sole interaction path.

## Empty-state CTA (Transactions card)

When there are no transactions yet, the Transactions card shows an empty state. This is a secondary entry point for import — zero visual clutter when data exists, maximum helpfulness on first use.

- Replaces the plain "No transactions yet" message with a short prompt + **Import CSV** button.
- Opens the same import modal/flow as the sidebar action — shared component, no duplication.
- Covers the first-time onboarding case without requiring the user to find the sidebar.

## Implementation phases

1. **Now:** Add Import CSV action to the desktop sidebar (Settings pinned at bottom). Mobile nav not yet implemented — import is desktop-only at this stage.
2. **Later:** Add empty-state CTA to the Transactions card — low effort, high value for first-time users.
3. **Later:** Build the mobile bottom tab bar with the dynamic slot logic and the "More" drawer.
4. **Later:** Expand `/settings` into a full page with multiple actions beyond import.

## UI library choice — Radix UI + Vaul

Modal (CSV import) and drawer (mobile "More") will use **Radix UI primitives** (`@radix-ui/react-dialog`) and **Vaul** for the bottom sheet.

shadcn was considered and rejected. It is built on Radix, so it provides no additional capability — it is Radix plus pre-applied Tailwind styles. Introducing it would create a dual-system (CSS modules + Tailwind-heavy shadcn components) for no functional gain. Using Radix directly keeps styling fully in CSS modules, consistent with the rest of the codebase.

The choice is not about lib-vs-scratch either. Both Radix and a custom implementation require understanding focus trapping, aria roles, scroll locking, and animation. Radix handles the solved accessibility infrastructure; the meaningful work is in how the component is composed and integrated — which is the same either way.

## Open questions

- Exact threshold for "recent pages" — 1 or 2 dynamic slots? (Current lean: 2, giving a 4-item bar: Home + 2 recent + More)
- Persist last-visited tabs across sessions (localStorage) or reset on each visit?
- Settings icon choice: gear (`Settings` from lucide) or something else consistent with the existing icon set.
