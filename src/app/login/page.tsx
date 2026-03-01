import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { locales } from "@/lib/i18n"
import { getServerLocale, getT } from "@/lib/i18n-server"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const locale = await getServerLocale()
  const t = await getT(locale)
  const languageOptions = locales.map((loc) => ({
    value: loc,
    label: t(`language.options.${loc}`),
  }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Suspense fallback={null}>
        <LoginForm
          locale={locale}
          title={t("login.title")}
          description={t("login.description")}
          emailLabel={t("login.email")}
          passwordLabel={t("login.password")}
          emailPlaceholder={t("login.emailPlaceholder")}
          submitLabel={t("login.submit")}
          submittingLabel={t("login.submitting")}
          invalidCredentialsLabel={t("login.invalid")}
          languageLabel={t("language.label")}
          languageOptions={languageOptions}
          emailRequiredLabel={t("auth.login.emailRequired")}
          emailInvalidLabel={t("auth.login.emailInvalid")}
          passwordRequiredLabel={t("auth.login.passwordRequired")}
        />
      </Suspense>
    </div>
  )
}
