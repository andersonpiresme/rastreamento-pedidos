import React, { useMemo, useState } from "react";

// === CONFIGURAÇÃO ===
const STEPS = [
  { id: 1, label: "1 - Recebimento do Pedido" },
  { id: 2, label: "2 - Recebimento de Materiais" },
  { id: 3, label: "3 - Fila de produção" },
  { id: 4, label: "4 - Em Produção" },
  { id: 5, label: "5 - Faturado" },
  { id: 6, label: "6 - Entrega Realizada" },
];

// Paleta simples para estados
const statusTone = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("aguardando")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("cancel")) return "bg-red-50 text-red-700 border-red-200";
  if (s.includes("entrega") || s.includes("faturado")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

// Converte "2 - Recebimento de Materiais" -> 2
const etapaIndex = (etapa) => {
  if (!etapa) return 0;
  const m = String(etapa).match(/^(\d+)/);
  const idx = m ? parseInt(m[1], 10) : 0;
  return Math.min(Math.max(idx, 1), STEPS.length);
};

// Utilidade para datas
const formatDate = (d) => new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const daysDiff = (a, b = new Date()) => Math.ceil((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));

// === EXEMPLO DE DADOS ===
// Substitua por sua integração (Sheets, API, CSV) mantendo as chaves abaixo
const SAMPLE = [
  {
    industria: "KDU",
    dataEmissao: "2025-09-15",
    faturado: 0,
    pendente: 1202,
    numeroERP: "185128",
    previsaoEntrega: "2026-01-30",
    etapa: "2 - Recebimento de Materiais",
    status: "Aguardando Tecidos",
    produtos: "Calça Sarja"
  },
  {
    industria: "Luiz Eugenio",
    dataEmissao: "2025-09-24",
    faturado: 633,
    pendente: 698,
    numeroERP: "198745",
    previsaoEntrega: "2025-12-15",
    etapa: "3 - Na fila de produção",
    status: "Aguardando janela de produção",
    produtos: "Camisas LD"
  },
  {
    industria: "Luiz Eugenio",
    dataEmissao: "2025-08-18",
    faturado: 237,
    pendente: 263,
    numeroERP: "199548",
    previsaoEntrega: "2025-12-15",
    etapa: "3 - Na fila de produção",
    status: "Aguardando janela de produção",
    produtos: "Camisas Lisas"
  },
  {
    industria: "Luiz Eugenio",
    dataEmissao: "2025-09-26",
    faturado: 0,
    pendente: 601,
    numeroERP: "200448",
    previsaoEntrega: "2025-11-30",
    etapa: "2 - Recebimento de Materiais",
    status: "Aguardando Tecidos",
    produtos: "Calças Sarja"
  },
  {
    industria: "Don Geuroth",
    dataEmissao: "2025-09-20",
    faturado: 0,
    pendente: 641,
    numeroERP: "3101",
    previsaoEntrega: "2025-10-25",
    etapa: "2 - Recebimento de Materiais",
    status: "Aguardando Etiquetas e Logos",
    produtos: "Camisetas e Polos"
  },
];

function ProgressStepper({ etapa }) {
  const idx = etapaIndex(etapa); // 1..6
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {/* Linha de fundo */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200" />
        {STEPS.map((s, i) => {
          const stepNo = i + 1;
          const isDone = stepNo < idx;
          const isCurrent = stepNo === idx;
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center w-full">
              <div className={
                `flex items-center justify-center w-7 h-7 rounded-full border text-xs font-semibold 
                 ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                 ${isCurrent && !isDone ? "bg-sky-600 border-sky-600 text-white" : ""}
                 ${!isDone && !isCurrent ? "bg-white border-slate-300 text-slate-500" : ""}`
              }>
                {stepNo}
              </div>
              <span className="mt-2 text-[10px] sm:text-xs text-slate-600 text-center leading-tight">
                {s.label.replace(/^\d+\s-\s/, "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ o }) {
  const idx = etapaIndex(o.etapa);
  const pct = Math.round((idx - 1) / (STEPS.length - 1) * 100);
  const etaDays = daysDiff(o.previsaoEntrega);
  const tone = statusTone(o.status);

 return (
  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm bg-white hover:shadow-md transition">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="text-slate-900 font-semibold text-lg">{o.industria}</div>
        <div className="text-slate-500 text-sm flex flex-wrap items-center gap-1">
          <span>
            Nº ERP <span className="font-medium text-slate-700">{o.numeroERP}</span> • Emissão {formatDate(o.dataEmissao)}
          </span>
          {o.produtos && (
            <>
              <span>•</span>
              <span className="font-medium text-slate-700">{o.produtos}</span>
            </>
          )}
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs border ${tone}`}>{o.status}</div>
    </div>

      <div className="mt-4">
        <ProgressStepper etapa={o.etapa} />
      </div>

      <div className="mt-4">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-sky-600" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
          <span>Etapa atual: <span className="font-medium text-slate-800">{o.etapa}</span></span>
          <span>Progresso: <span className="font-medium text-slate-800">{pct}%</span></span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[11px] text-slate-500">Faturado</div>
          <div className="text-slate-900 font-semibold">{o.faturado} peças</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[11px] text-slate-500">Pendente</div>
          <div className="text-slate-900 font-semibold">{o.pendente} peças</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[11px] text-slate-500">Previsão de Entrega</div>
          <div className="text-slate-900 font-semibold">{formatDate(o.previsaoEntrega)}</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="text-[11px] text-slate-500">ETA</div>
          <div className={`font-semibold ${etaDays < 0 ? "text-emerald-700" : etaDays <= 15 ? "text-amber-700" : "text-slate-900"}`}>
            {etaDays < 0 ? "Entregue / vencido" : `${etaDays} dias`}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [q, setQ] = useState("");
  const data = SAMPLE; // troque pela sua origem real

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return data;
    return data.filter((o) =>
      [o.industria, o.numeroERP, o.status, o.etapa].join(" ").toLowerCase().includes(k)
    );
  }, [q, data]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Rastreamento de Pedidos</h1>
            <p className="text-slate-600 text-sm">Visual moderno estilo e‑commerce para seus clientes acompanharem o andamento.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por indústria, nº ERP, status..."
              className="w-full sm:w-80 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </header>

        <main className="mt-6 grid gap-4 sm:gap-6 grid-cols-1">
          {filtered.map((o) => (
            <OrderCard key={o.numeroERP + o.industria} o={o} />
          ))}
          {filtered.length === 0 && (
            <div className="text-slate-500 text-sm">Nenhum pedido encontrado com esse filtro.</div>
          )}
        </main>

        <footer className="mt-10 text-[11px] text-slate-500">
          <p>
            Atualizado em: 08/10/2025
          </p>
        </footer>
      </div>
    </div>
  );
}
