import { useTranslation } from "react-i18next";
import type { CheckedItemKey } from "@/utils/types/footer-types";

const SECTIONS = ["s1", "s2", "s3"] as const;

export function TopicPage({ topicKey }: { topicKey: CheckedItemKey }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-h2 mb-1">{t(`website_${topicKey}_title`)}</h2>
      <p className="text-body text-muted mb-10">{t(`website_${topicKey}_subtitle`)}</p>

      <div className="flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <div key={s}>
            <h3 className="text-h3 mb-2">{t(`website_${topicKey}_${s}_heading`)}</h3>
            <p className="text-body text-muted">{t(`website_${topicKey}_${s}_body`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
