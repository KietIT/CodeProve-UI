import AuthCallbackClient from "./AuthCallbackClient";

type SearchParams = {
  token?: string;
  error?: string;
  /** "1" when this Google sign-in created the account (counted as a GA4 sign_up). */
  new_user?: string;
};

export default function AuthCallbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <AuthCallbackClient
      token={searchParams.token}
      error={searchParams.error}
      newUser={searchParams.new_user === "1"}
    />
  );
}
