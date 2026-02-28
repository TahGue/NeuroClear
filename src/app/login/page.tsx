import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { getServerLocale, getT } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const locale = await getServerLocale()
  const t = await getT(locale)

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
          languageEnLabel={t("language.en")}
          languageFrLabel={t("language.fr")}
        />
      </Suspense>
    </div>
  )
}
