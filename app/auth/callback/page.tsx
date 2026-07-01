import AuthCallbackClient from "./AuthCallbackClient";

type SearchParams = {
  token?: string;
  error?: string;
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
    />
  );
}
