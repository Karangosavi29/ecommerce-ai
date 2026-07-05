import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminUsers } from "@/api/admin.api";
import Spinner from "@/components/shared/Spinner";
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
      <h1 className="mb-6 text-2xl font-bold">Users</h1>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Role</th>
              <th className="p-3 text-left font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b last:border-0">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
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