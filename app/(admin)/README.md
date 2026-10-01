# Admin UI

Routes: `/admin-login`, `/admin`, `/admin/admins` (super admin only), `/admin/users`, `/admin/users/[id]`, `/admin/exercises`, `/admin/exercises/new`, `/admin/exercises/[code]`, `/admin/change-password`.

Admin sign-in uses `POST /api/auth/admin/login` and a separate HttpOnly cookie session; the admin UI never stores a token in localStorage. Browser requests pass through the same-origin `/api/admin-gateway` route, which forwards only admin endpoints to `NEXT_PUBLIC_API_URL`. `GET /api/auth/admin/me` returns the role and `must_change_password`. Both `admin` and `super_admin` must change a temporary password before entering admin pages. The backend enforces this on every admin API. Google login and public signup are unavailable for admin IDs.

To review the overview and user UI without backend data, run the app in development and open `/admin?demo=1`. This local preview shows the fixtures in `admin/_data.ts`; it does not enable access in a production build. `/admin/admins` and the exercise workflow require a real admin session.

The admin header and sign-in page use the app's existing VI/EN preference. User rows and user detail show a Free, Plus or Pro badge; the list can also filter by plan. These plan values are sample fixtures, not subscriptions read from the backend.

The exercise list and editor now use the admin API. Admins can create drafts, save changes, validate content, submit it for review, approve or reject another admin's draft, and publish approved content. A new exercise appears to learners only after publication. The editor sends `expected_revision` on writes so a stale tab cannot overwrite newer changes. The password form calls `POST /api/auth/admin/change-password`. The super admin page reads real admin accounts and audit events, including exercise creation, editing, review and publication, and can create, disable, enable and reset regular admin accounts. Temporary passwords are shown once and are never stored by the UI.

Backend work needed before production use:

- Implement admin overview and user list/detail APIs. Never expose hidden tests, reference solutions, or mutants through learner endpoints.
- Include each user's effective subscription plan (`free`, `plus`, or `pro`) in admin user list/detail APIs. The UI should read the effective plan from the subscription source of truth, including downgrade/expiry behavior, rather than infer it from the marketing pricing page.
- Replace the remaining overview and user fixtures in `admin/_data.ts` with these APIs. Keep server authorization authoritative; the layout check only controls the UI.
