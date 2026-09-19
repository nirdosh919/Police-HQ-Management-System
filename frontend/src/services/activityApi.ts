export type AuditLog = {
  _id: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  action: string;
  module: string;
  description?: string;
  statusCode?: number;
  createdAt: string;
};

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export async function getRecentActivity(limit = 8): Promise<AuditLog[]> {
  const token = localStorage.getItem("phq_auth_token");

  const response = await fetch(`${API}/audit?limit=${limit}`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  if (response.status === 401) {
    localStorage.removeItem("phq_auth_token");
    window.location.assign("/login");
    return [];
  }

  if (!response.ok) {
    throw new Error("Unable to load recent activity");
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}
