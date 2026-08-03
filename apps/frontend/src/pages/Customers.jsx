import { useEffect, useState } from "react";
import { get, post, del } from "../api/client";
import { useAuth } from "../context/useAuth";
import { canManage } from "../context/canManage";
import Modal from "../components/Modal";

function Customers() {
  const { employee: currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const canDelete = canManage(currentUser, ["A"]);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError("");
    try {
      const data = await get("/customers");
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setPhone("");
    setEmailInput("");
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await post("/customers", { cust_name: name, cust_phone: phone, cust_email: emailInput });
      resetForm();
      setShowModal(false);
      await loadCustomers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(custNo) {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    setError("");
    try {
      await del(`/customers/${custNo}`);
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="text-zinc-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Customers</h2>
        <button onClick={() => setShowModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded transition">
          + Add Customer
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-sm">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Email</th>
              {canDelete && <th className="py-2 pr-4"></th>}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.cust_no} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                <td className="py-2 pr-4 text-white">{c.cust_no}</td>
                <td className="py-2 pr-4 text-white">{c.cust_name}</td>
                <td className="py-2 pr-4 text-zinc-300">{c.cust_phone}</td>
                <td className="py-2 pr-4 text-zinc-300">{c.cust_email}</td>
                {canDelete && (
                  <td className="py-2 pr-4">
                    <button onClick={() => handleDelete(c.cust_no)} className="text-red-400 hover:text-red-300 text-sm">
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Add New Customer">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded">{formError}</p>}
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94771234567"
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm mb-1">Email</label>
            <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <button type="submit" disabled={submitting}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition">
            {submitting ? "Adding..." : "Add Customer"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default Customers;