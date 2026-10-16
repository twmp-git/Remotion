import React, { useLayoutEffect, useRef, useState } from "react";
import { useDelayRender } from "remotion";
import { kkFontsReady } from "./brand";

type FitBoxProps = {
  /** Position and size of the area the text must stay inside. */
  style: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  /** Largest font size, in px. */
  max: number;
  /** Smallest acceptable font size, in px. Below this the box shows a "too long" warning. */
  min: number;
  step?: number;
  /** Re-fit whenever this changes (pass the text). */
  fitKey: string;
  children: React.ReactNode;
};

/**
 * Picks the largest font size between `min` and `max` at which the content fits the box,
 * so short stories grow to fill the frame and long ones shrink.
 * Children should size everything in `em` so spacing scales with the text.
 * If even `min` overflows, a red warning is drawn so a too-long story is never missed.
 */
export const FitBox: React.FC<FitBoxProps> = ({
  style,
  contentStyle,
  max,
  min,
  step = 0.25,
  fitKey,
  children,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pending = useRef<number[]>([]);
  const [fit, setFit] = useState({ fontSize: max, overflows: false, run: 0 });
  const { delayRender, continueRender } = useDelayRender();

  useLayoutEffect(() => {
    pending.current.push(delayRender("Fitting Kaya Kurrent text into its frame"));
    let cancelled = false;
    kkFontsReady.then(() => {
      const box = boxRef.current;
      const content = contentRef.current;
      if (cancelled || !box || !content) {
        return;
      }
      const fits = (size: number) => {
        content.style.fontSize = `${size}px`;
        return (
          content.offsetHeight <= box.clientHeight &&
          content.scrollWidth <= content.clientWidth
        );
      };
      let size = max;
      while (size > min && !fits(size)) {
        size = Math.max(min, size - step);
      }
      const overflows = !fits(size);
      setFit((prev) => ({ fontSize: size, overflows, run: prev.run + 1 }));
    });
    return () => {
      cancelled = true;
    };
  }, [fitKey, max, min, step, delayRender]);

  // Release the render only after the fitted size has been committed.
  useLayoutEffect(() => {
    if (fit.run === 0) {
      return;
    }
    for (const handle of pending.current) {
      continueRender(handle);
    }
    pending.current = [];
  }, [fit, continueRender]);

  return (
    <div ref={boxRef} style={{ position: "absolute", ...style }}>
      <div ref={contentRef} style={{ ...contentStyle, fontSize: fit.fontSize }}>
        {children}
      </div>
      {fit.overflows ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "8px 12px",
            background: "#E00000",
            color: "#FFFFFF",
            font: "700 24px Arial, sans-serif",
            textAlign: "center",
          }}
        >
          TEXT TOO LONG — trim the story
        </div>
      ) : null}
    </div>
  );
};
