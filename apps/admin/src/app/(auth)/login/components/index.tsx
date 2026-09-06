"use client";

import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Field, FieldError, FieldLabel } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { useData } from "./index.hook";
import { TEXTS } from "./texts";

export function Index() {
  const vm = useData();
  const { errors } = vm.form.formState;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          <h1>{TEXTS.PAGE_TITLE}</h1>
        </CardTitle>
        <CardDescription>{TEXTS.PAGE_DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={vm.onSubmit} noValidate className="space-y-4">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">{TEXTS.EMAIL}</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...vm.form.register("email")}
            />
            <FieldError errors={errors.email ? [errors.email] : undefined} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">{TEXTS.PASSWORD}</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...vm.form.register("password")}
            />
            <FieldError errors={errors.password ? [errors.password] : undefined} />
          </Field>
          {errors.root ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={vm.isPending}>
            {vm.isPending ? TEXTS.SUBMITTING : TEXTS.SUBMIT}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
