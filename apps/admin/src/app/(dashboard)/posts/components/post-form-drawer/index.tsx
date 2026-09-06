"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import type { CreatePostInput } from "@repo/dtos";
import { PostStatusEnum } from "@repo/enums";
import { Button } from "@repo/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { Textarea } from "@repo/ui/textarea";
import { slugify } from "@repo/utils";
import { TEXTS } from "../texts";

export type PostFormDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreatePostInput>;
  onSubmit: () => void;
  isPending: boolean;
  mode: "create" | "edit";
};

/** Create/edit form for a post. Presentational: all state comes from the page hook. */
export function PostFormDrawer({
  open,
  onOpenChange,
  form,
  onSubmit,
  isPending,
  mode,
}: PostFormDrawerProps) {
  const { errors } = form.formState;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? TEXTS.DRAWER_EDIT_TITLE : TEXTS.DRAWER_CREATE_TITLE}
          </SheetTitle>
          <SheetDescription>{TEXTS.DRAWER_DESCRIPTION}</SheetDescription>
        </SheetHeader>

        <form
          id="post-form"
          onSubmit={onSubmit}
          noValidate
          className="flex-1 space-y-4 overflow-y-auto px-4"
        >
          <Field data-invalid={!!errors.title?.en}>
            <FieldLabel htmlFor="title-en">{TEXTS.FIELD_TITLE_EN}</FieldLabel>
            <Input
              id="title-en"
              aria-invalid={!!errors.title?.en}
              {...form.register("title.en", {
                onChange: (e) => {
                  if (mode === "create" && !form.formState.dirtyFields.slug) {
                    form.setValue("slug", slugify(e.target.value));
                  }
                },
              })}
            />
            <FieldError errors={errors.title?.en ? [errors.title.en] : undefined} />
          </Field>

          <Field data-invalid={!!errors.title?.fa}>
            <FieldLabel htmlFor="title-fa">{TEXTS.FIELD_TITLE_FA}</FieldLabel>
            <Input id="title-fa" dir="rtl" {...form.register("title.fa")} />
            <FieldError errors={errors.title?.fa ? [errors.title.fa] : undefined} />
          </Field>

          <Field data-invalid={!!errors.slug}>
            <FieldLabel htmlFor="slug">{TEXTS.FIELD_SLUG}</FieldLabel>
            <Input id="slug" aria-invalid={!!errors.slug} {...form.register("slug")} />
            <FieldDescription>{TEXTS.FIELD_SLUG_HINT}</FieldDescription>
            <FieldError errors={errors.slug ? [errors.slug] : undefined} />
          </Field>

          <Field>
            <FieldLabel htmlFor="excerpt-en">{TEXTS.FIELD_EXCERPT_EN}</FieldLabel>
            <Textarea id="excerpt-en" rows={3} {...form.register("excerpt.en")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="status">{TEXTS.FIELD_STATUS}</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value ?? PostStatusEnum.DRAFT} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PostStatusEnum).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {errors.root ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          ) : null}
        </form>

        <SheetFooter className="flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {TEXTS.CANCEL}
          </Button>
          <Button type="submit" form="post-form" disabled={isPending}>
            {isPending ? TEXTS.SAVING : TEXTS.SAVE}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
