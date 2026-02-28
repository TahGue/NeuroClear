export function getNextAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET

  if (secret) return secret

  return "dev-nextauth-secret"
}
