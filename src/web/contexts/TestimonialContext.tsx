import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import * as testimonialService from "@/services/testimonialService";

// Testimonial interface
export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  rating: number; // 1-5
  title: string;
  message: string;
  showName: boolean;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  adminNote?: string;
}

// Initial mock data
const initialTestimonials: Testimonial[] = [
  {
    id: "tst_1",
    userId: "user_1",
    userName: "João Silva",
    userPhoto: "",
    rating: 5,
    title: "Melhor plataforma de bolões!",
    message: "Já participei de vários bolões e a experiência sempre foi ótima. A equipe é muito transparente e o suporte é excelente. Recomendo a todos que querem aumentar suas chances de ganhar na loteria!",
    showName: true,
    status: "approved",
    submittedAt: "2025-01-10T10:30:00Z",
    approvedAt: "2025-01-12T14:00:00Z",
    approvedBy: "admin",
  },
  {
    id: "tst_2",
    userId: "user_2",
    userName: "Maria Santos",
    userPhoto: "",
    rating: 5,
    title: "Ganhei meu primeiro prêmio!",
    message: "Participei de um bolão da Mega-Sena e ganhamos! O processo de saque foi super rápido e sem complicações. A plataforma é muito confiável.",
    showName: true,
    status: "pending",
    submittedAt: "2025-02-05T09:15:00Z",
  },
  {
    id: "tst_3",
    userId: "user_3",
    userName: "Carlos Oliveira",
    userPhoto: "",
    rating: 4,
    title: "Muito satisfeito com o serviço",
    message: "A experiência tem sido muito boa. Os bolões são bem organizados e dá pra acompanhar tudo em tempo real. Só falta melhorar o app mobile.",
    showName: false,
    status: "pending",
    submittedAt: "2025-02-06T11:45:00Z",
  },
  {
    id: "tst_4",
    userId: "user_4",
    userName: "Ana Paula Costa",
    userPhoto: "",
    rating: 5,
    title: "Excelente custo-benefício",
    message: "Participar de bolões aqui é muito mais barato do que jogar sozinho e as chances são muito maiores. Super recomendo para quem quer economizar!",
    showName: true,
    status: "approved",
    submittedAt: "2025-02-01T16:20:00Z",
    approvedAt: "2025-02-03T10:30:00Z",
    approvedBy: "admin",
  },
  {
    id: "tst_5",
    userId: "user_5",
    userName: "Roberto Ferreira",
    userPhoto: "",
    rating: 3,
    title: "Bom, mas pode melhorar",
    message: "A plataforma funciona bem, mas achei o suporte um pouco demorado quando tive uma dúvida sobre minha participação.",
    showName: true,
    status: "pending",
    submittedAt: "2025-02-07T08:00:00Z",
  },
  {
    id: "tst_6",
    userId: "user_6",
    userName: "Patricia Lima",
    userPhoto: "",
    rating: 5,
    title: "Indiquei para toda família!",
    message: "Desde que comecei a usar o BolãoMax minha experiência com loterias mudou completamente. Muito mais fácil, seguro e com melhores chances de ganhar!",
    showName: true,
    status: "approved",
    submittedAt: "2025-01-15T13:30:00Z",
    approvedAt: "2025-01-17T09:00:00Z",
    approvedBy: "admin",
  },
  {
    id: "tst_7",
    userId: "user_7",
    userName: "Lucas Mendes",
    userPhoto: "",
    rating: 4,
    title: "Plataforma confiável",
    message: "Uso há 3 meses e até agora tudo certo. Os resultados são divulgados rapidamente e os prêmios pagos sem problemas. Recomendo!",
    showName: true,
    status: "pending",
    submittedAt: "2025-02-08T15:45:00Z",
  },
  {
    id: "tst_8",
    userId: "user_8",
    userName: "Fernanda Souza",
    userPhoto: "",
    rating: 5,
    title: "Experiência incrível!",
    message: "Nunca pensei que participar de bolões seria tão fácil. O site é muito intuitivo e o suporte sempre responde rápido. Nota 10!",
    showName: true,
    status: "approved",
    submittedAt: "2025-01-20T17:00:00Z",
    approvedAt: "2025-01-22T11:30:00Z",
    approvedBy: "admin",
  },
  {
    id: "tst_9",
    userId: "user_9",
    userName: "Pedro Augusto",
    userPhoto: "",
    rating: 4,
    title: "Muito bom para quem quer economizar",
    message: "Consigo participar de vários bolões com valores acessíveis. A transparência no sorteio é o que mais me agrada na plataforma.",
    showName: true,
    status: "approved",
    submittedAt: "2025-01-25T10:15:00Z",
    approvedAt: "2025-01-27T14:45:00Z",
    approvedBy: "admin",
  },
  {
    id: "tst_10",
    userId: "user_10",
    userName: "Camila Rodrigues",
    userPhoto: "",
    rating: 5,
    title: "Já ganhei 2 vezes!",
    message: "Participando de bolões no BolãoMax já tive a sorte de ganhar 2 vezes. Os valores foram creditados rapidamente na minha conta. Excelente!",
    showName: true,
    status: "approved",
    submittedAt: "2025-01-28T09:30:00Z",
    approvedAt: "2025-01-30T16:00:00Z",
    approvedBy: "admin",
  },
  {
    id: "tst_11",
    userId: "user_11",
    userName: "Rafael Costa",
    userPhoto: "",
    rating: 4,
    title: "Recomendo sem dúvidas",
    message: "Ótima experiência até agora. O sistema de cotas é muito justo e fácil de entender. Pretendo continuar participando.",
    showName: false,
    status: "pending",
    submittedAt: "2025-02-09T12:00:00Z",
  },
];

// Context types
interface TestimonialContextType {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  submitTestimonial: (
    testimonial: Omit<Testimonial, "id" | "status" | "submittedAt" | "approvedAt" | "approvedBy" | "adminNote">
  ) => Promise<Testimonial>;
  getUserTestimonials: (userId: string) => Promise<Testimonial[]>;
  getAllTestimonials: () => Promise<Testimonial[]>;
  updateTestimonialStatus: (
    id: string,
    status: Testimonial["status"],
    adminNote?: string,
    approvedBy?: string
  ) => Promise<Testimonial | null>;
  deleteTestimonial: (id: string) => Promise<boolean>;
  getApprovedTestimonials: () => Testimonial[];
  editTestimonial: (
    id: string,
    updates: Partial<Pick<Testimonial, "rating" | "title" | "message" | "showName">>
  ) => Promise<Testimonial | null>;
  refreshTestimonials: () => Promise<void>;
}

// Create context
const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

// Provider component
export const TestimonialProvider = ({ children }: { children: ReactNode }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize testimonials from localStorage or use mock data
  useEffect(() => {
    const initializeTestimonials = async () => {
      try {
        const stored = testimonialService.getStoredTestimonials();
        if (stored.length > 0) {
          setTestimonials(stored);
        } else {
          // Initialize with mock data
          testimonialService.saveTestimonials(initialTestimonials);
          setTestimonials(initialTestimonials);
        }
      } catch (e) {
        setError("Failed to load testimonials");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    initializeTestimonials();
  }, []);

  // Refresh testimonials from storage
  const refreshTestimonials = async () => {
    setLoading(true);
    try {
      const stored = testimonialService.getStoredTestimonials();
      setTestimonials(stored);
    } catch (e) {
      setError("Failed to refresh testimonials");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Submit new testimonial
  const submitTestimonial = async (
    testimonial: Omit<Testimonial, "id" | "status" | "submittedAt" | "approvedAt" | "approvedBy" | "adminNote">
  ): Promise<Testimonial> => {
    const newTestimonial = await testimonialService.submitTestimonial(testimonial);
    setTestimonials(prev => [newTestimonial, ...prev]);
    return newTestimonial;
  };

  // Get user testimonials
  const getUserTestimonials = async (userId: string): Promise<Testimonial[]> => {
    return testimonials.filter(t => t.userId === userId);
  };

  // Get all testimonials (admin)
  const getAllTestimonials = async (): Promise<Testimonial[]> => {
    return testimonials;
  };

  // Update testimonial status (admin)
  const updateTestimonialStatus = async (
    id: string,
    status: Testimonial["status"],
    adminNote?: string,
    approvedBy?: string
  ): Promise<Testimonial | null> => {
    const updated = await testimonialService.updateTestimonialStatus(id, status, adminNote, approvedBy);
    if (updated) {
      setTestimonials(prev => prev.map(t => (t.id === id ? updated : t)));
    }
    return updated;
  };

  // Delete testimonial
  const deleteTestimonial = async (id: string): Promise<boolean> => {
    const success = await testimonialService.deleteTestimonial(id);
    if (success) {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    }
    return success;
  };

  // Get approved testimonials (public)
  const getApprovedTestimonials = (): Testimonial[] => {
    return testimonials.filter(t => t.status === "approved");
  };

  // Edit testimonial (only pending)
  const editTestimonial = async (
    id: string,
    updates: Partial<Pick<Testimonial, "rating" | "title" | "message" | "showName">>
  ): Promise<Testimonial | null> => {
    const updated = await testimonialService.editTestimonial(id, updates);
    if (updated) {
      setTestimonials(prev => prev.map(t => (t.id === id ? updated : t)));
    }
    return updated;
  };

  return (
    <TestimonialContext.Provider
      value={{
        testimonials,
        loading,
        error,
        submitTestimonial,
        getUserTestimonials,
        getAllTestimonials,
        updateTestimonialStatus,
        deleteTestimonial,
        getApprovedTestimonials,
        editTestimonial,
        refreshTestimonials,
      }}
    >
      {children}
    </TestimonialContext.Provider>
  );
};

// Hook to use testimonials
export const useTestimonials = (): TestimonialContextType => {
  const context = useContext(TestimonialContext);
  if (!context) {
    throw new Error("useTestimonials must be used within a TestimonialProvider");
  }
  return context;
};
