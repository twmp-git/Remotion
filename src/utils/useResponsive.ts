import { useVideoConfig } from "remotion";

/**
 * Returns a scale factor relative to the 1920×1080 design canvas, so sizes
 * authored for landscape HD adapt to 4K, square and vertical formats.
 *
 * Usage: const { s } = useResponsive(); fontSize: s(120)
 */
export const useResponsive = () => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width;
  // Portrait formats are designed against a 1080-wide canvas; text wraps instead of shrinking.
  const scale = isPortrait
    ? width / 1080
    : Math.min(width / 1920, height / 1080);
  return {
    scale,
    isPortrait,
    s: (px: number) => px * scale,
  };
};
