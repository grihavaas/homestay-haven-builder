"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  user_id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  displayName: string;
  created_at: string;
  membership_id: string | null;
  tenant_id: string | null;
  tenant_name: string | null;
  role: string | null;
}

interface Tenant {
  id: string;
  name: string;
}

interface UserListProps {
  users: User[];
  tenants: Tenant[];
  currentUserId: string;
  deleteAction: (membershipId: string) => Promise<void>;
  assignAction: (formData: FormData) => Promise<void>;
}

export function UserList({
  users,
  tenants,
  currentUserId,
  deleteAction,
  assignAction,
}: UserListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [userList, setUserList] = useState(users);

  // Sync with props when users change (e.g., after router.refresh())
  useEffect(() => {
    setUserList(users);
  }, [users]);

  const handleDelete = async (membershipId: string) => {
    setDeletingId(membershipId);
    try {
      await deleteAction(membershipId);
      // Update the user's membership in the list
      setUserList((prev) =>
        prev.map((u) =>
          u.membership_id === membershipId
            ? { ...u, membership_id: null, tenant_id: null, tenant_name: null, role: null }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to delete membership:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssign = async (userId: string, tenantId: string, role: string) => {
    if (!tenantId || !role) return;

    setAssigningId(userId);
    try {
      const formData = new FormData();
      formData.set("user_id", userId);
      formData.set("tenant_id", tenantId);
      formData.set("role", role);
      await assignAction(formData);

      // Update local state - find tenant name
      const tenant = tenants.find((t) => t.id === tenantId);
      setUserList((prev) =>
        prev.map((u) =>
          u.user_id === userId
            ? { ...u, tenant_id: tenantId, tenant_name: tenant?.name || null, role }
            : u
        )
      );
    } catch (error) {
      console.error("Failed to assign tenant:", error);
    } finally {
      setAssigningId(null);
    }
  };

  // Separate users into assigned and unassigned
  const assignedUsers = userList.filter((u) => u.membership_id);
  const unassignedUsers = userList.filter((u) => !u.membership_id);

  return (
    <div className="mt-8 space-y-8">
      {/* Assigned Users */}
      <div>
        <h3 className="text-sm font-medium text-zinc-600 mb-2">
          Assigned Users ({assignedUsers.length})
        </h3>
        <div className="rounded-lg border">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
            <div>User</div>
            <div>Tenant</div>
            <div>Role</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {assignedUsers.map((user) => {
              const isCurrentUser = user.user_id === currentUserId;
              const isDeleting = deletingId === user.membership_id;

              return (
                <div
                  key={user.membership_id}
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
                    {!user.first_name && !user.last_name && (user.email || user.phone) && (
                      <div className="mt-0.5 text-xs text-zinc-500">
                        {user.email || user.phone}
                      </div>
                    )}
                  </div>
                  <div>{user.tenant_name || "—"}</div>
                  <div>{user.role || "—"}</div>
                  <div>
                    {isCurrentUser ? (
                      <span className="text-xs text-zinc-400">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(user.membership_id!)}
                        disabled={isDeleting || deletingId !== null}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          "Remove"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {assignedUsers.length === 0 && (
              <div className="p-3 text-sm text-zinc-600">No assigned users.</div>
            )}
          </div>
        </div>
      </div>

      {/* Unassigned Users */}
      {unassignedUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-600 mb-2">
            Unassigned Users ({unassignedUsers.length})
          </h3>
          <div className="rounded-lg border">
            <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
              <div>User</div>
              <div>Tenant</div>
              <div>Role</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {unassignedUsers.map((user) => {
                const isAssigning = assigningId === user.user_id;

                return (
                  <AssignRow
                    key={user.user_id}
                    user={user}
                    tenants={tenants}
                    isAssigning={isAssigning}
                    disabled={assigningId !== null}
                    onAssign={handleAssign}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssignRow({
  user,
  tenants,
  isAssigning,
  disabled,
  onAssign,
}: {
  user: User;
  tenants: Tenant[];
  isAssigning: boolean;
  disabled: boolean;
  onAssign: (userId: string, tenantId: string, role: string) => void;
}) {
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState("");

  return (
    <div
      className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 text-sm ${
        isAssigning ? "opacity-50" : ""
      }`}
    >
      <div>
        <div>{user.displayName}</div>
        {!user.first_name && !user.last_name && (
          <div className="mt-0.5 text-xs text-zinc-500">
            {user.email || user.phone}
          </div>
        )}
        {user.email && user.phone && (
          <div className="mt-0.5 text-xs text-zinc-500">{user.phone}</div>
        )}
      </div>
      <div>
        <select
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          disabled={disabled}
          className="w-full text-xs rounded border px-2 py-1 disabled:opacity-50"
        >
          <option value="">Select...</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={disabled}
          className="w-full text-xs rounded border px-2 py-1 disabled:opacity-50"
        >
          <option value="">Select...</option>
          <option value="tenant_admin">Admin</option>
          <option value="tenant_editor">Editor</option>
        </select>
      </div>
      <div>
        <button
          type="button"
          onClick={() => onAssign(user.user_id, tenantId, role)}
          disabled={disabled || !tenantId || !role}
          className="text-xs text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {isAssigning ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Assigning...
            </>
          ) : (
            "Assign"
          )}
        </button>
      </div>
    </div>
  );
}
