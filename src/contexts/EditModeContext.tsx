"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { useProperty } from "./PropertyContext";

interface EditModeContextType {
  isEditMode: boolean;
  canEdit: boolean;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
  activeEditor: string | null;
  setActiveEditor: (editor: string | null) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  canEdit: false,
  toggleEditMode: () => {},
  setEditMode: () => {},
  activeEditor: null,
  setActiveEditor: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);
  const { user, memberships } = useAuth();
  const { property } = useProperty();

  // User can edit if they're authenticated and have an appropriate role for this property's tenant.
  // agency_admin can edit any property. Others need a membership matching the property's tenant.
  const matchingMembership = property
    ? memberships.find(
        (m) =>
          m.role === "agency_admin" ||
          m.tenant_id === property.tenant_id
      )
    : undefined;
  const canEdit =
    !!user && !!matchingMembership && !!property &&
    (matchingMembership.role === "agency_admin" ||
      matchingMembership.role === "tenant_admin" ||
      matchingMembership.role === "tenant_editor" ||
      matchingMembership.role === "agency_rm");

  const toggleEditMode = useCallback(() => {
    if (canEdit) {
      setIsEditMode((prev) => !prev);
      if (isEditMode) {
        setActiveEditor(null);
      }
    }
  }, [canEdit, isEditMode]);

  const setEditMode = useCallback(
    (value: boolean) => {
      if (canEdit) {
        setIsEditMode(value);
        if (!value) {
          setActiveEditor(null);
        }
      }
    },
    [canEdit]
  );

  return (
    <EditModeContext.Provider
      value={{
        isEditMode,
        canEdit,
        toggleEditMode,
        setEditMode,
        activeEditor,
        setActiveEditor,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within EditModeProvider");
  }
  return context;
}
