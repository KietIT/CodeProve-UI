/** A signed-in account as returned by the auth endpoints. */
export type User = {
  id: number;
  full_name: string;
  email: string;
  /** Canonical `0xxxxxxxxx`; `null` for accounts created before phones were required and for Google sign-ins. */
  phone: string | null;
  avatar?: string | null;
};

/** `GET /auth/me` and `PATCH /auth/me` return the account directly. */
export type Me = User;

/** `POST /auth/login` and `POST /auth/signup` responses. */
export type AuthOut = {
  user: User;
  access_token: string;
};
