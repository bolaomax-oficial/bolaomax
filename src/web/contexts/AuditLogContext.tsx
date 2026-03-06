import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Types for audit log entries
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  adminUser: string;
  adminEmail: string;
  bolaoId: string;
  bolaoCode: string;
  bolaoName: string;
  bolaoType: "lotofacil" | "megasena" | "quina";
  changeType: "create" | "edit" | "status_change" | "delete" | "bulk_edit";
  changes: FieldChange[];
  reason?: string;
  isSpecialEvent?: boolean;
}

export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: string;
  newValue: string;
}

interface AuditLogContextType {
  // All audit entries
  entries: AuditLogEntry[];
  
  // Add new entry
  addEntry: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  
  // Get entries for a specific bolão
  getEntriesByBolao: (bolaoId: string) => AuditLogEntry[];
  
  // Get entries by admin
  getEntriesByAdmin: (adminEmail: string) => AuditLogEntry[];
  
  // Get entries by date range
  getEntriesByDateRange: (startDate: Date, endDate: Date) => AuditLogEntry[];
  
  // Get entries by change type
  getEntriesByChangeType: (changeType: AuditLogEntry["changeType"]) => AuditLogEntry[];
  
  // Export to CSV
  exportToCSV: () => string;
  
  // Clear old entries (older than X days)
  clearOldEntries: (daysOld: number) => void;
}

const AuditLogContext = createContext<AuditLogContextType | null>(null);

const STORAGE_KEY = "bolaomax_audit_log";

// Helper to generate unique IDs
const generateId = () => `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Field label mapping for human-readable display
export const fieldLabels: Record<string, string> = {
  dataSorteio: "Data do Sorteio",
  horarioSorteio: "Horário do Sorteio",
  dataEncerramento: "Data de Encerramento",
  horarioEncerramento: "Horário de Encerramento",
  premioEstimado: "Prêmio Estimado",
  status: "Status",
  valorTotal: "Valor Total",
  dezenas: "Quantidade de Dezenas",
  name: "Nome do Bolão",
  disponivel: "Disponibilidade",
  jogosPerCard: "Jogos por Card",
  isSpecialEvent: "Evento Especial",
  specialEventName: "Nome do Evento Especial",
  teimosinha: "Teimosinha",
};

// Status label mapping
export const statusLabels: Record<string, string> = {
  aberto: "Ativo",
  fechado: "Fechado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  cancelado: "Cancelado",
};

export const AuditLogProvider = ({ children }: { children: ReactNode }) => {
  // Sample mock data for demonstration
  const mockEntries: AuditLogEntry[] = [
    {
      id: "audit_demo_1",
      timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      adminUser: "Administrador",
      adminEmail: "admin@bolaomax.com",
      bolaoId: "BOL002",
      bolaoCode: "BOL-0002",
      bolaoName: "Mega da Virada 2024",
      bolaoType: "megasena",
      changeType: "edit",
      changes: [
        { field: "premioEstimado", fieldLabel: "Prêmio Estimado", oldValue: "R$ 500.000.000", newValue: "R$ 550.000.000" },
        { field: "dataSorteio", fieldLabel: "Data do Sorteio", oldValue: "30/12/2024", newValue: "31/12/2024" },
      ],
      reason: "Atualização conforme última estimativa da Caixa Econômica Federal",
      isSpecialEvent: true,
    },
    {
      id: "audit_demo_2",
      timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      adminUser: "Administrador",
      adminEmail: "admin@bolaomax.com",
      bolaoId: "BOL003",
      bolaoCode: "BOL-0003",
      bolaoName: "Quina de São João",
      bolaoType: "quina",
      changeType: "status_change",
      changes: [
        { field: "status", fieldLabel: "Status", oldValue: "Pausado", newValue: "Ativo" },
      ],
      reason: "Reativação após resolução de problema técnico",
      isSpecialEvent: true,
    },
    {
      id: "audit_demo_3",
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      adminUser: "Administrador",
      adminEmail: "admin@bolaomax.com",
      bolaoId: "BOL001",
      bolaoCode: "BOL-0001",
      bolaoName: "Lotofácil Especial",
      bolaoType: "lotofacil",
      changeType: "edit",
      changes: [
        { field: "horarioSorteio", fieldLabel: "Horário do Sorteio", oldValue: "19:00", newValue: "20:00" },
      ],
      isSpecialEvent: false,
    },
  ];

  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  // Load entries from localStorage on mount (or use mock data if empty)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
        } else {
          // Initialize with mock data for demo
          setEntries(mockEntries);
        }
      } else {
        // Initialize with mock data for demo
        setEntries(mockEntries);
      }
    } catch (e) {
      console.error("Failed to load audit log from storage:", e);
      setEntries(mockEntries);
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save audit log to storage:", e);
    }
  }, [entries]);

  // Add new entry
  const addEntry = useCallback((entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  }, []);

  // Get entries for a specific bolão
  const getEntriesByBolao = useCallback(
    (bolaoId: string): AuditLogEntry[] => {
      return entries.filter((e) => e.bolaoId === bolaoId);
    },
    [entries]
  );

  // Get entries by admin
  const getEntriesByAdmin = useCallback(
    (adminEmail: string): AuditLogEntry[] => {
      return entries.filter((e) => e.adminEmail === adminEmail);
    },
    [entries]
  );

  // Get entries by date range
  const getEntriesByDateRange = useCallback(
    (startDate: Date, endDate: Date): AuditLogEntry[] => {
      const start = startDate.getTime();
      const end = endDate.getTime();
      return entries.filter((e) => e.timestamp >= start && e.timestamp <= end);
    },
    [entries]
  );

  // Get entries by change type
  const getEntriesByChangeType = useCallback(
    (changeType: AuditLogEntry["changeType"]): AuditLogEntry[] => {
      return entries.filter((e) => e.changeType === changeType);
    },
    [entries]
  );

  // Export to CSV
  const exportToCSV = useCallback((): string => {
    const headers = [
      "Data/Hora",
      "Administrador",
      "Código Bolão",
      "Nome Bolão",
      "Tipo",
      "Tipo de Alteração",
      "Campos Alterados",
      "Motivo",
    ];

    const rows = entries.map((entry) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");
      const changesStr = entry.changes
        .map((c) => `${c.fieldLabel}: "${c.oldValue}" → "${c.newValue}"`)
        .join("; ");
      
      const changeTypeLabels: Record<string, string> = {
        create: "Criação",
        edit: "Edição",
        status_change: "Mudança de Status",
        delete: "Exclusão",
        bulk_edit: "Edição em Lote",
      };

      return [
        dateStr,
        entry.adminUser,
        entry.bolaoCode,
        entry.bolaoName,
        entry.bolaoType,
        changeTypeLabels[entry.changeType] || entry.changeType,
        changesStr,
        entry.reason || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return csvContent;
  }, [entries]);

  // Clear old entries
  const clearOldEntries = useCallback((daysOld: number) => {
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    setEntries((prev) => prev.filter((e) => e.timestamp >= cutoff));
  }, []);

  return (
    <AuditLogContext.Provider
      value={{
        entries,
        addEntry,
        getEntriesByBolao,
        getEntriesByAdmin,
        getEntriesByDateRange,
        getEntriesByChangeType,
        exportToCSV,
        clearOldEntries,
      }}
    >
      {children}
    </AuditLogContext.Provider>
  );
};

export const useAuditLog = (): AuditLogContextType => {
  const context = useContext(AuditLogContext);
  if (!context) {
    throw new Error("useAuditLog must be used within an AuditLogProvider");
  }
  return context;
};

export default AuditLogContext;
