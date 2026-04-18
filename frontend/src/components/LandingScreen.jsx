import React from "react";

function OptionCard({ icon, title, subtitle, onClick, variant }) {
  const btnClass = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button
      onClick={onClick}
      className="card group flex flex-1 flex-col items-center gap-4 p-8 text-center transition hover:-translate-y-0.5"
      style={{ minHeight: "300px" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
        style={{ backgroundColor: "var(--surface-muted)", border: "0.5px solid var(--hair)" }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-[17px] font-semibold text-slate-900">{title}</h3>
        <p className="mt-1.5 max-w-[18rem] text-[13px] text-slate-500">{subtitle}</p>
      </div>
      <span className={btnClass + " mt-auto w-full justify-center"}>Bắt đầu</span>
    </button>
  );
}

export default function LandingScreen({ onPick }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-10 text-center md:pt-20">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg text-base font-semibold text-brand-300"
        style={{ backgroundColor: "#0B1220", border: "0.5px solid var(--hair)" }}
      >
        eI
      </div>
      <h1 className="text-[26px] font-semibold text-slate-900">
        e<span className="text-brand">Insight</span>
      </h1>
      <p className="mt-1.5 text-[13px] text-slate-500">
        App Review Intelligence · eUp Group
      </p>
      <p className="mt-6 max-w-lg text-[14px] text-slate-600">
        Chọn chế độ phù hợp với mục tiêu của bạn để bắt đầu phân tích review app.
      </p>

      <div className="mt-10 flex w-full flex-col gap-4 md:flex-row">
        <OptionCard
          icon={<span>📱</span>}
          title="My App"
          subtitle="Theo dõi review app của bạn hàng ngày."
          variant="primary"
          onClick={() => onPick("myapp")}
        />
        <OptionCard
          icon={<span>🔍</span>}
          title="Market Research"
          subtitle="Phân tích và so sánh app của bạn với đối thủ."
          variant="secondary"
          onClick={() => onPick("research")}
        />
      </div>
    </div>
  );
}
