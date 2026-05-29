## MoveIQ — Build Plan

### Design System
- Background `#f5f0e8`, text `#1a1a1a`, accent forest green `#2d5a3d`
- Headings: **Cormorant Garamond** (serif, intelligent character)
- Body: **Inter** (clean sans-serif)
- Tokens in `src/styles.css` as oklch (no dark mode)
- Generous spacing, slow transitions (400–700ms ease-out), subtle paper texture overlay
- No form tags — `onClick`/`onChange` only

### Backend (Lovable Cloud)
Enable Cloud, then:

**Tables**
- `profiles` (id → auth.users, display_name, role enum `student`|`coach`, created_at)
- `user_roles` (separate table, enum + `has_role` security-definer fn — per security best practice)
- `analyses` (id, user_id, video_path, movement_type, notes, ai_feedback jsonb {what_we_found, compensation_pattern, refinement_practice}, awareness_score int, coach_note, status enum `pending`|`reviewed`, created_at)
- `streaks` (user_id PK, current_streak int, last_practice_date)

**Storage**: private `movement-videos` bucket; signed URLs for playback.

**RLS**: students read/write own analyses; coaches (via `has_role`) read all + update `coach_note`/`status`.

**Server functions** (`src/lib/*.functions.ts`):
- `analyzeMovement` — calls Lovable AI Gateway (`google/gemini-2.5-flash`) with system prompt steeped in Movimentica language; returns the four-section feedback + score
- `getMyAnalyses`, `getAnalysis`, `getPendingReviews`, `submitCoachNote`

### Routes (TanStack Start)
```
/                      → Landing + auth
/_authenticated/
  dashboard            → Student dashboard
  upload               → Upload flow (multi-step state machine in one route)
  analyses/$id         → Analysis detail view
  coach                → Coach dashboard (gated by has_role)
```

### Screens
1. **Landing/Auth** — centered, serif headline "Understand how you move.", email/password + role toggle (Student/Coach). Single panel switches between sign-in/sign-up via state.
2. **Student Dashboard** — warm time-aware greeting, two stat tiles (analyses completed, practice streak), large dashed-green upload zone linking to `/upload`, card feed of past analyses.
3. **Upload Flow** — 4 steps with slow fade transitions: video file picker → movement-type chips → notes textarea → loading screen ("Reading your movement pattern…" with breathing circle animation, ~6–8s). Uploads to storage, invokes `analyzeMovement`, redirects to detail.
4. **Analysis Detail** — two-column: signed-URL `<video>` left; right panel with four labeled sections + large score in soft green ring (SVG circular progress). "Request Coach Review" button sets status `pending`.
5. **Coach Dashboard** — list of pending analyses with student name, click opens same detail view in coach mode with editable note + "Mark as Reviewed".

### Copy Language Guard
All UI strings audited for: practice, refine, explore, pattern, awareness, foundation, structure. Banned: workout, reps, grind, hustle, optimize.

### Build Order
1. Enable Lovable Cloud, create migration (tables, enums, RLS, storage bucket + policies, has_role fn)
2. Design tokens + fonts in `styles.css`, install Cormorant via Google Fonts link
3. Auth route + sign-in/up
4. `_authenticated` layout with role context
5. Student dashboard + analysis card component
6. Upload flow + storage upload + `analyzeMovement` server fn (Lovable AI Gateway)
7. Analysis detail view with circular score ring + breathing animations
8. Coach dashboard + review flow
9. Slop-sweep: verify Movimentica vocabulary, slow transitions, no form tags

### Technical notes
- AI Gateway via `LOVABLE_API_KEY` in server fn (auto-provisioned); model `google/gemini-2.5-flash`, JSON response format, schema validated with Zod
- Score derived from AI response (40–95 range), stored alongside feedback
- Streak updated on each new analysis (calendar-day increment)
- Bearer attacher already in template — verify `attachSupabaseAuth` is registered in `src/start.ts`