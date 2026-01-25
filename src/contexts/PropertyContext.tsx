import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getCurrentHostname } from "@/lib/hostname";
import { resolvePropertyIdByHostname, fetchPublishedProperty } from "@/lib/propertyQueries";

type PropertyContextType = {
  property: any | null;
  loading: boolean;
  error: string | null;
};

const PropertyContext = createContext<PropertyContextType>({
  property: null,
  loading: true,
  error: null,
});

export function PropertyProvider({ children }: { children: ReactNode }) {
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperty() {
      try {
        setLoading(true);
        setError(null);
        const hostname = getCurrentHostname();
        if (!hostname) {
          setError("Could not determine hostname");
          setLoading(false);
          return;
        }
        const id = await resolvePropertyIdByHostname(hostname);
        if (!id) {
          setError(`No property found for hostname: ${hostname}`);
          setLoading(false);
          return;
        }
        const data = await fetchPublishedProperty(id);
        if (!data) {
          setError("Property not found or not published");
          setLoading(false);
          return;
        }
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load property");
        console.error("Property load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, []);

  return (
    <PropertyContext.Provider value={{ property, loading, error }}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within PropertyProvider");
  }
  return context;
}
