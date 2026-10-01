# Admin UI

Routes: `/admin-login`, `/admin`, `/admin/users`, `/admin/users/[id]`, `/admin/exercises`, `/admin/exercises/[code]`, `/admin/change-password`.

The admin area uses the existing email/password auth provider. It denies access unless `/auth/me` returns `role: "admin"`. If that response also includes `must_change_password: true`, the layout routes the admin to `/admin/change-password`. Google login and public signup are absent from `/admin-login`.

To review the UI before the backend role exists, run the app in development and open `/admin?demo=1`. This local preview shows the fixtures in `admin/_data.ts`; it does not enable access in a production build. All values shown in the admin pages are marked as sample data.

The exercise editor keeps changes in component state. Its download action creates a draft content JSON file for review; it does not save or publish. The password form calls the planned `POST /api/auth/change-password` endpoint and reports when it is unavailable.

Backend work needed before production use:

- Add persisted user role and `must_change_password` to login and `/auth/me` responses.
- Provision admin accounts internally; enforce admin role and forced password change on every admin API.
- Implement password change with `current_password` and `new_password`, then return the updated first-login flag from `/auth/me`.
- Implement admin overview, user list/detail, and exercise draft/validate/review/publish APIs. Never expose hidden tests, reference solutions, or mutants through learner endpoints.
- Replace the fixtures in `admin/_data.ts` with these APIs. Keep server authorization authoritative; the layout check only controls the UI.
