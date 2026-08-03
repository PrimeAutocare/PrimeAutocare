import { useEffect, useState } from "react";
import { get, patch } from "../api/client";

const STATUS_LABELS = {
  U: "Unpaid",
  P: "Partially paid",
  S: "Settled",
  V: "Void",
};

const STATUS_STYLES = {
  U: "text-red-400",
  P: "text-amber-400",
  S: "text-green-400",
  V: "text-zinc-500",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const METHOD_LABELS = { C: "Cash", R: "Card", T: "Transfer", Q: "Cheque" };

const METHOD_OPTIONS = Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }));

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [invoicesData, paymentsData] = await Promise.all([
        get("/invoices"),
        get("/payments"),
      ]);
      setInvoices(invoicesData);
      setPayments(paymentsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadAll();
    })();
  }, []);

  async function handleStatusChange(invNo, newStatus) {
    setError("");
    try {
      await patch(`/invoices/${invNo}`, { inv_status: newStatus });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMethodChange(payNo, newMethod) {
    setError("");
    try {
      await patch(`/payments/${payNo}`, { pay_method: newMethod });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  const paidByInvoice = payments.reduce((acc, p) => {
    acc[p.inv_no] = (acc[p.inv_no] ?? 0) + Number(p.pay_amount);
    return acc;
  }, {});

  const money = (n) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const live = invoices.filter((i) => i.inv_status !== "V");
  const billed = live.reduce((s, i) => s + Number(i.inv_total), 0);
  const collected = live.reduce((s, i) => s + (paidByInvoice[i.inv_no] ?? 0), 0);
  const outstanding = billed - collected;

  if (loading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-white">Invoices</h2>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Billed</p>
          <p className="text-xl font-semibold text-white">{money(billed)}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Collected</p>
          <p className="text-xl font-semibold text-green-400">{money(collected)}</p>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Outstanding</p>
          <p className="text-xl font-semibold text-amber-400">{money(outstanding)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">Invoice</th>
              <th className="py-2 pr-4">Job</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Total</th>
              <th className="py-2 pr-4">Paid</th>
              <th className="py-2 pr-4">Balance</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Payments</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => {
              const paid = paidByInvoice[i.inv_no] ?? 0;
              const balance = Number(i.inv_total) - paid;
              const invoicePayments = payments.filter((p) => p.inv_no === i.inv_no);
              return (
                <tr key={i.inv_no} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="py-2 pr-4 text-white">{i.inv_no}</td>
                  <td className="py-2 pr-4 text-zinc-300">{i.job_id}</td>
                  <td className="py-2 pr-4 text-zinc-300">{i.inv_date}</td>
                  <td className="py-2 pr-4 text-zinc-300">{money(i.inv_total)}</td>
                  <td className="py-2 pr-4 text-zinc-300">{money(paid)}</td>
                  <td className="py-2 pr-4 text-zinc-300">{money(balance)}</td>
                  <td className="py-2 pr-4">
                    <select
                      value={i.inv_status}
                      onChange={(e) => handleStatusChange(i.inv_no, e.target.value)}
                      className={`bg-zinc-700 text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500 ${STATUS_STYLES[i.inv_status] ?? "text-white"}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4 text-zinc-400 text-sm">
                    {invoicePayments.length === 0 ? (
                      "-"
                    ) : (
                      <div className="flex flex-col gap-1">
                        {invoicePayments.map((p) => (
                          <select
                            key={p.pay_no}
                            value={p.pay_method}
                            onChange={(e) => handleMethodChange(p.pay_no, e.target.value)}
                            className="bg-zinc-700 text-white text-xs rounded px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {METHOD_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Invoices;