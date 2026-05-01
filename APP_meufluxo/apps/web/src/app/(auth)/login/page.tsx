"use client";

import Link from "next/link";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { translateAuthDisplayError } from "@/features/auth/lib/translate-auth-error";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/auth";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, error } = useAuth();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    await login(values.email, values.password);
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const errorMessage = React.useMemo(() => translateAuthDisplayError(error, t), [error, t]);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">{t("auth.login")}</CardTitle>
        <CardDescription>{t("auth.loginDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" placeholder={t("auth.placeholderEmail")} autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.entering") : t("auth.login")}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link className="text-primary underline-offset-4 hover:underline" href="#">
              {t("auth.createWorkspace")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


