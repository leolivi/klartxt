import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiskScoreDialog } from "./RiskScoreDialog";
import { LEVEL_COLORS } from "./riskScoreConfig";
import { useTabDataContext } from "../../context/useTabDataContext";

const R = 45;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function RiskScoreSection() {
  const { riskScore: score } = useTabDataContext();
  const { t } = useTranslation();
  const level = Math.min(Math.max(score, 1), 5);
  const colors = LEVEL_COLORS[level];
  const dashOffset = CIRCUMFERENCE * (1 - level / 5);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimated(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <div className="flex gap-8 items-center p-4">
        <div className={`rounded-full bg-surface-secondary dark:bg-surface-secondary border-6 border-surface-tertiary relative size-24 shrink-0 flex justify-center items-center ${colors}`}>
          <svg className="absolute -inset-1.5 -rotate-90 pointer-events-none" viewBox="0 0 96 96" fill="none">
            <circle
              cx="48" cy="48" r={R}
              strokeWidth="6"
              className="stroke-ink-strong"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={animated ? dashOffset : CIRCUMFERENCE}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="flex flex-col items-center">
            <p className="text-[28px] font-semibold text-inherit border-ink-default/80 border-b-2">{score}</p>
            <p className="text-[16px] text-ink-default">5</p>
          </div>
          <RiskScoreDialog/>
        </div>
        <div className="text-left">
          <p className="text-h3 pb-2 text-ink-strongest">{t(`riskScore${level}Label`)}</p>
          <p className="text-body text-ink-default">{t(`riskScore${level}Explanation`)}</p>
          <p className="text-body text-ink-strong">{t(`riskScore${level}Recommendation`)}</p>
        </div>
      </div>
    </>
  );
}
