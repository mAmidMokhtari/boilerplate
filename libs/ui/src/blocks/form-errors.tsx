import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

type ServerErrorLike = {
  errors?: Record<string, string | string[]>;
  message?: string;
};

/**
 * Maps a 422 response (`{ errors: { field: ["msg"] } }`) onto react-hook-form
 * fields so server validation shows inline exactly like client validation.
 * Unknown fields fall back to a root error you can render above the form.
 */
export function applyServerErrors<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  error: ServerErrorLike | null | undefined
): void {
  if (!error?.errors) {
    if (error?.message) form.setError("root", { type: "server", message: error.message });
    return;
  }
  const knownFields = new Set(Object.keys(form.getValues()));
  for (const [field, value] of Object.entries(error.errors)) {
    const message = Array.isArray(value) ? value[0] : value;
    if (!message) continue;
    if (knownFields.has(field)) {
      form.setError(field as Path<TValues>, { type: "server", message });
    } else {
      form.setError("root", { type: "server", message });
    }
  }
}
