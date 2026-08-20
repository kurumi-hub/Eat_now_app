type RouteLoadingProps = {
  label?: string;
};

export default function RouteLoading({
  label = "Đang tải nội dung...",
}: RouteLoadingProps) {
  return (
    <main className="route-loading" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="route-loading__bar route-loading__bar--short" />
      <div className="route-loading__bar route-loading__bar--title" />
      <div className="route-loading__grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="route-loading__card" key={index}>
            <div className="route-loading__media" />
            <div className="route-loading__bar" />
            <div className="route-loading__bar route-loading__bar--short" />
          </div>
        ))}
      </div>
    </main>
  );
}
