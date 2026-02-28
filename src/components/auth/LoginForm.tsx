"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"

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

  const formSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string().min(1, { message: "Password is required" }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: callbackUrl || undefined,
    })

    if (!res || res.error) {
      toast.error(invalidCredentialsLabel)
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{emailLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={emailPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{passwordLabel}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
