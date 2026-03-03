"use client";

import { useState } from "react";
import { HostsForm } from "./HostsForm";
import { HostsList } from "./HostsList";

interface Host {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  writeup: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  response_time: string | null;
}

interface HostsManagerProps {
  hosts: Host[];
  createHost: (formData: FormData) => Promise<void>;
  updateHost: (formData: FormData) => Promise<void>;
  deleteHost: (formData: FormData) => Promise<void>;
}

export function HostsManager({ hosts, createHost, updateHost, deleteHost }: HostsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editHostId, setEditHostId] = useState<string | null>(null);

  return (
    <>
      <div className="mt-6">
        <HostsForm 
          createHost={createHost} 
          isOpen={showForm}
          onOpenChange={setShowForm}
        />
      </div>

      {!showForm && (
        <HostsList
          hosts={hosts}
          editHostId={editHostId}
          onEdit={setEditHostId}
          updateHost={updateHost}
          deleteHost={deleteHost}
        />
      )}
    </>
  );
}
