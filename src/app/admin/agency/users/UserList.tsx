"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  user_id: string;
  tenant_id: string;
  role: string;
  email?: string;
  phone?: string;
  displayName: string;
  tenants?: { name: string }[] | { name: string } | null;
}

interface UserListProps {
  users: User[];
  currentUserId: string;
  deleteAction: (membershipId: string) => Promise<void>;
}

export function UserList({ users, currentUserId, deleteAction }: UserListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userList, setUserList] = useState(users);

  const handleDelete = async (membershipId: string) => {
    setDeletingId(membershipId);
    try {
      await deleteAction(membershipId);
      // Remove the deleted user from the list
      setUserList((prev) => prev.filter((u) => u.id !== membershipId));
    } catch (error) {
      console.error("Failed to delete membership:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8 rounded-lg border">
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
        <div>User</div>
        <div>Tenant</div>
        <div>Role</div>
        <div>Actions</div>
      </div>
      <div className="divide-y">
        {userList.map((user) => {
          const isCurrentUser = user.user_id === currentUserId;
          const isDeleting = deletingId === user.id;

          return (
            <div
              key={user.id}
              className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 text-sm ${
                isDeleting ? "opacity-50" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {user.displayName}
                  {isCurrentUser && (
                    <span className="text-xs bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                      You
                    </span>
                  )}
                </div>
                {user.email && user.phone && (
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {user.phone}
                  </div>
                )}
                <div className="mt-1 font-mono text-xs text-zinc-400">
                  {user.user_id}
                </div>
              </div>
              <div>
                {Array.isArray(user.tenants)
                  ? user.tenants[0]?.name || "—"
                  : user.tenants?.name || "—"}
              </div>
              <div>{user.role}</div>
              <div>
                {isCurrentUser ? (
                  <span className="text-xs text-zinc-400">—</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting || deletingId !== null}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {userList.length === 0 && (
          <div className="p-3 text-sm text-zinc-600">No users yet.</div>
        )}
      </div>
    </div>
  );
}
