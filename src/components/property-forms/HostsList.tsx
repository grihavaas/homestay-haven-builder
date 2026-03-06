export interface Host {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  writeup: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  response_time: string | null;
  languages?: string[];
}

interface HostsListProps {
  hosts: Host[];
  editHostId: string | null;
  onEdit: (hostId: string | null) => void;
  updateHost: (formData: FormData) => Promise<void>;
  deleteHost: (formData: FormData) => Promise<void>;
}

import { HostRow } from "./HostRow";

export function HostsList({ hosts, editHostId, onEdit, updateHost, deleteHost }: HostsListProps) {
  return (
    <div className="mt-8 rounded-lg border">
      <div className="border-b bg-zinc-50 p-3 text-sm font-medium">
        Hosts
      </div>
      <div className="divide-y">
        {hosts.map((host) => (
          <HostRow
            key={host.id}
            host={host}
            isEditing={editHostId === host.id}
            onEdit={onEdit}
            updateHost={updateHost}
            deleteHost={deleteHost}
          />
        ))}
        {hosts.length === 0 ? (
          <div className="p-3 text-sm text-zinc-600">No hosts yet.</div>
        ) : null}
      </div>
    </div>
  );
}

