"use client";

import { useI18n } from "@/lib/i18n";
import { WarningIcon } from "@/components/icons";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <WarningIcon className="h-7 w-7" />
      </div>
      <div>
        <p className="font-heading text-lg font-semibold text-ink">{t("somethingWrong")}</p>
        {error.message && (
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{error.message}</p>
        )}
      </div>
      <button onClick={reset} className="btn-primary px-6 py-2.5">
        {t("tryAgain")}
      </button>
    </div>
  );
}
