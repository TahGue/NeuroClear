"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher"

type Props = {
  locale: "en" | "fr"
  title: string
  description: string
  emailLabel: string
  passwordLabel: string
  emailPlaceholder: string
  submitLabel: string
  submittingLabel: string
  invalidCredentialsLabel: string
  languageLabel: string
  languageEnLabel: string
  languageFrLabel: string
}

export function LoginForm({
  locale,
  title,
  description,
  emailLabel,
  passwordLabel,
  emailPlaceholder,
  submitLabel,
  submittingLabel,
  invalidCredentialsLabel,
  languageLabel,
  languageEnLabel,
  languageFrLabel,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl || undefined,
    })

    setIsSubmitting(false)

    if (!res || res.error) {
      setError(invalidCredentialsLabel)
      return
    }

    const destination = callbackUrl && callbackUrl !== "/" ? callbackUrl : "/dashboard"
    router.push(destination)
    router.refresh()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher locale={locale} label={languageLabel} enLabel={languageEnLabel} frLabel={languageFrLabel} />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{emailLabel}</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={emailPlaceholder} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{passwordLabel}</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
