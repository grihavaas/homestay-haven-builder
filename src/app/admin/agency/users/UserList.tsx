"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export interface MembershipRow {
  id: string;
  user_id: string;
  tenant_id: string;
  tenant_name: string;
  role: string;
}

interface UserInfo {
  id: string;
  user_id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  displayName: string;
}

interface Tenant {
  id: string;
  name: string;
}

interface UserListProps {
  users: UserInfo[];
  memberships: MembershipRow[];
  tenants: Tenant[];
  currentUserId: string;
  userDisplayMap: Record<string, string>;
  deleteAction: (membershipId: string) => Promise<void>;
  assignAction: (formData: FormData) => Promise<void>;
}

export function UserList({
  users,
  memberships,
  tenants,
  currentUserId,
  userDisplayMap,
  deleteAction,
  assignAction,
}: UserListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [membershipList, setMembershipList] = useState(memberships);

  useEffect(() => {
    setMembershipList(memberships);
  }, [memberships]);

  const handleDelete = async (membershipId: string) => {
    setDeletingId(membershipId);
    try {
      await deleteAction(membershipId);
      setMembershipList((prev) => prev.filter((m) => m.id !== membershipId));
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
      router.refresh();
    } catch (error) {
      console.error("Failed to assign:", error);
    } finally {
      setAssigningId(null);
    }
  };

  // Unassigned = users with no membership rows
  const assignedUserIds = new Set(membershipList.map((m) => m.user_id));
  const unassignedUsers = users.filter((u) => !assignedUserIds.has(u.user_id));

  return (
    <div className="mt-8 space-y-8">
      {/* All assignments: one row per membership (same user can appear multiple times) */}
      <div>
        <h3 className="text-sm font-medium text-zinc-600 mb-2">
          Assignments ({membershipList.length})
        </h3>
        <p className="text-xs text-zinc-500 mb-2">
          One row per user–customer–role. Same user can have multiple customers (e.g. agency_rm,
          agency_admin).
        </p>
        <div className="rounded-lg border">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
            <div>User</div>
            <div>Customer</div>
            <div>Role</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {membershipList.map((m) => {
              const isCurrentUser = m.user_id === currentUserId;
              const isDeleting = deletingId === m.id;

              return (
                <div
                  key={m.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 text-sm ${
                    isDeleting ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {userDisplayMap[m.user_id] ?? m.user_id.slice(0, 8) + "..."}
                      {isCurrentUser && (
                        <span className="text-xs bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  <div>{m.tenant_name}</div>
                  <div>{m.role}</div>
                  <div>
                    {isCurrentUser ? (
                      <span className="text-xs text-zinc-400">—</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
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
            {membershipList.length === 0 && (
              <div className="p-3 text-sm text-zinc-600">No assignments yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Assign to another customer: any user + tenant + role (adds a new membership) */}
      <div>
        <h3 className="text-sm font-medium text-zinc-600 mb-2">
          Assign to another customer
        </h3>
        <p className="text-xs text-zinc-500 mb-2">
          Add a user to an additional customer (or assign an unassigned user). Same user can be
          assigned to multiple customers.
        </p>
        <AssignToCustomerForm
          users={users}
          tenants={tenants}
          assigningId={assigningId}
          onAssign={handleAssign}
        />
      </div>

      {/* Unassigned users: quick assign */}
      {unassignedUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-600 mb-2">
            Unassigned users ({unassignedUsers.length})
          </h3>
          <div className="rounded-lg border">
            <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b bg-zinc-50 p-3 text-sm font-medium">
              <div>User</div>
              <div>Customer</div>
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

function AssignToCustomerForm({
  users,
  tenants,
  assigningId,
  onAssign,
}: {
  users: UserInfo[];
  tenants: Tenant[];
  assigningId: string | null;
  onAssign: (userId: string, tenantId: string, role: string) => void;
}) {
  const [userId, setUserId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 p-3 text-sm items-end rounded-lg border bg-zinc-50/50">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">User</label>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={assigningId !== null}
          className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm disabled:opacity-50"
        >
          <option value="">Select user...</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.displayName} {u.email ? `(${u.email})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Customer</label>
        <select
          value={tenantId}
          onChange={(e) => setTenantId(e.target.value)}
          disabled={assigningId !== null}
          className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm disabled:opacity-50"
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
        <label className="block text-xs font-medium text-zinc-500 mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={assigningId !== null}
          className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm disabled:opacity-50"
        >
          <option value="">Select...</option>
          <option value="agency_admin">Agency Admin</option>
          <option value="agency_rm">Relationship Manager</option>
          <option value="tenant_admin">Customer Admin</option>
          <option value="tenant_editor">Customer Editor</option>
        </select>
      </div>
      <div>
        <button
          type="button"
          onClick={() => userId && onAssign(userId, tenantId, role)}
          disabled={assigningId !== null || !userId || !tenantId || !role}
          className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {assigningId === userId ? (
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

function AssignRow({
  user,
  tenants,
  isAssigning,
  disabled,
  onAssign,
}: {
  user: UserInfo;
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
          <option value="agency_admin">Agency Admin</option>
          <option value="agency_rm">Relationship Manager</option>
          <option value="tenant_admin">Customer Admin</option>
          <option value="tenant_editor">Customer Editor</option>
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
