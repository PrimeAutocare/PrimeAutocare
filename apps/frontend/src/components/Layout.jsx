import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const ADMIN_NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/customers", label: "Customers" },
  { to: "/employees", label: "Employees" },
  { to: "/job-catalog", label: "Job Catalog" },
  { to: "/invoices", label: "Invoices" },
  { to: "/attendance", label: "Attendance" },
  { to: "/reports", label: "Reports" },
];

const EMPLOYEE_NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/jobs", label: "My Jobs" },
  { to: "/attendance", label: "Attendance" },
  { to: "/reports", label: "Reports" },
];

function Layout() {
  const { employee, logout } = useAuth();

  const navItems = employee?.emp_role === "A" ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <div className="h-screen flex bg-zinc-900 text-white overflow-hidden">
      <aside className="w-64 h-screen bg-zinc-800 flex flex-col p-4 sticky top-0">
        <h1 className="text-xl font-bold mb-8 shrink-0">PrimeAutocare</h1>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded transition ${
                  isActive
                    ? "bg-orange-600 text-white"
                    : "text-zinc-300 hover:bg-zinc-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-zinc-700 pt-4 mt-4 shrink-0">
          <p className="text-sm text-zinc-400 mb-2">
            {employee?.emp_gname} {employee?.emp_fname}
          </p>
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-sm py-2 rounded transition"
          >
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
