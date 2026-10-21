type Props = {
  value: string;
  max: number;
};

/**
 * "12 / 60", quiet until the limit is near, then ember.
 * Orange here is the one allowed warning outside magnets, CTA and errors
 * (see the design skill); it's only announced once it matters.
 */
export function CharCounter({ value, max }: Props) {
  const used = value.length;
  const nearLimit = used >= max * 0.85;
  return (
    <span
      aria-live={nearLimit ? "polite" : "off"}
      className={`text-xs tabular-nums ${nearLimit ? "text-ember" : "text-ink-quiet"}`}
    >
      {used} / {max}
    </span>
  );
}
