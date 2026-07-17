import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminUsers } from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import type { AdminUserSummary } from "@/types";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminUsers()
      .then((res) => setUsers(res.data.users ?? res.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <AdminPageHeader
        title="Users"
        description={`${users.length} user${users.length === 1 ? "" : "s"}`}
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="p-3 text-left font-semibold text-foreground">Name</th>
              <th className="p-3 text-left font-semibold text-foreground">Email</th>
              <th className="p-3 text-left font-semibold text-foreground">Role</th>
              <th className="p-3 text-left font-semibold text-foreground">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-border last:border-0 hover:bg-accent/40">
                <td className="p-3 font-semibold text-foreground">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}