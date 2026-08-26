export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[10px] font-semibold"
      style={{
        width: size,
        height: size,
        background: "var(--brand-gradient)",
        color: "#ffffff",
        fontSize: size * 0.52,
        letterSpacing: "-0.02em",
      }}
    >
      L
    </div>
  );
}
