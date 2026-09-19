import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileText,
  Building2,
  MapPin,
  UserCircle,
  ChevronDown,
  LogOut,
  RefreshCw,
  Menu,
  X
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Officers", path: "/officers", icon: Users },
  { name: "Attendance", path: "/attendance", icon: ClipboardCheck },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "Departments", path: "/departments", icon: Building2 },
  { name: "Police Stations", path: "/police-stations", icon: MapPin }
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminRef = useRef<HTMLDivElement>(null);

  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState("Administrator");

  useEffect(() => {
    const stored = localStorage.getItem("phq_user");

    if (stored) {
      try {
        const user = JSON.parse(stored);
        setAdminName(
          user.name ||
          user.fullName ||
          user.username ||
          "Administrator"
        );
      } catch {
        setAdminName("Administrator");
      }
    }

    const token = localStorage.getItem("phq_auth_token");

    if (token) {
      fetch(
        `${window.location.protocol}//${window.location.hostname}:5000/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
        .then((response) => {
          if (!response.ok) return null;
          return response.json();
        })
        .then((data) => {
          const user = data?.user || data;

          if (!user) return;

          setAdminName(
            user.name ||
            user.fullName ||
            user.username ||
            "Administrator"
          );

          localStorage.setItem("phq_user", JSON.stringify(user));
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        adminRef.current &&
        !adminRef.current.contains(event.target as Node)
      ) {
        setAdminOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setAdminOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("phq_auth_token");
    localStorage.removeItem("phq_user");
    setAdminOpen(false);
    navigate("/login", { replace: true });
  };

  const refreshAccount = () => {
    setAdminOpen(false);
    window.location.reload();
  };

  const openProfile = () => {
    setAdminOpen(false);
    navigate("/administrator-profile");
  };

  const currentPage =
    menuItems.find((item) =>
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path)
    )?.name || "Administrator Profile";

  return (
    <div className="phq-portal">

      {/* TOP UTILITY BAR */}
      <div className="phq-utility">
        <div>Government Administration Portal</div>

        <div className="phq-utility-right">
          <span>Accessibility</span>
          <span>English</span>
          <span>हिन्दी</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="phq-header">

        <div className="phq-logo-wrap">
          <img
            src="/up-police-logo.png"
            alt="Police HQ"
            className="phq-real-logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              const fallback =
                event.currentTarget.nextElementSibling as HTMLElement | null;

              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />

          <div
            className="phq-fallback-logo"
            style={{ display: "none" }}
          >
            UP
            <br />
            POLICE
          </div>

          <div>
            <div className="phq-brand-title">
              POLICE HQ
            </div>

            <div className="phq-brand-subtitle">
              MANAGEMENT SYSTEM
            </div>

            <div className="phq-brand-meta">
              Personnel & Administrative Management Portal
            </div>
          </div>
        </div>

        {/* ADMINISTRATOR — TOP RIGHT */}
        <div
          className="phq-admin-area"
          ref={adminRef}
        >
          <button
            type="button"
            className="phq-admin-button"
            onClick={() => setAdminOpen((value) => !value)}
            aria-expanded={adminOpen}
            aria-haspopup="menu"
          >
            <span className="phq-admin-icon">
              <UserCircle size={21} />
            </span>

            <span className="phq-admin-label">
              {adminName || "Administrator"}
            </span>

            <ChevronDown
              size={17}
              className={adminOpen ? "phq-chevron-open" : ""}
            />
          </button>

          {adminOpen && (
            <div className="phq-admin-dropdown" role="menu">

              <div className="phq-admin-dropdown-head">
                <div className="phq-admin-avatar">
                  <UserCircle size={25} />
                </div>

                <div>
                  <strong>{adminName || "Administrator"}</strong>
                  <span>Administrator</span>
                </div>
              </div>

              <div className="phq-admin-divider" />

              <button
                type="button"
                onClick={refreshAccount}
                role="menuitem"
              >
                <RefreshCw size={17} />
                <span>Refresh Account</span>
              </button>

              <button
                type="button"
                onClick={openProfile}
                role="menuitem"
              >
                <UserCircle size={17} />
                <span>Profile</span>
              </button>

              <div className="phq-admin-divider" />

              <button
                type="button"
                onClick={logout}
                role="menuitem"
                className="phq-logout-button"
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>

            </div>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className="phq-mobile-menu-button"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

      </header>

      {/* NAVIGATION */}
      <nav className={`phq-nav ${mobileOpen ? "phq-nav-mobile-open" : ""}`}>

        <div className="phq-nav-inner">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `phq-nav-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </div>

      </nav>

      {/* BREADCRUMB */}
      <div className="phq-breadcrumb">
        <span>Home</span>
        <span className="phq-breadcrumb-separator">/</span>
        <strong>{currentPage}</strong>
      </div>

      {/* PAGE CONTENT */}
      <main className="phq-content">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="phq-footer">
        <div>
          Police HQ Management System
        </div>

        <div>
          Personnel & Administrative Management Portal
        </div>
      </footer>

    </div>
  );
}
