/** A signed-in account as returned by the auth endpoints. */
export type User = {
  id: number;
  full_name: string;
  email: string;
  avatar?: string | null;
};

/** `GET /auth/me` and `PATCH /auth/me` return the account directly. */
export type Me = User;

/** `POST /auth/login` and `POST /auth/signup` responses. */
export type AuthOut = {
  user: User;
  access_token: string;
};
