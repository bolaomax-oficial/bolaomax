// Testimonial service for API-ready functions
// Currently using localStorage, can be replaced with API calls later

import type { Testimonial } from "@/contexts/TestimonialContext";

const STORAGE_KEY = "testimonials";

// Get all testimonials from storage
export const getStoredTestimonials = (): Testimonial[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading testimonials from localStorage:", e);
  }
  return [];
};

// Save testimonials to storage
export const saveTestimonials = (testimonials: Testimonial[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  } catch (e) {
    console.error("Error saving testimonials to localStorage:", e);
  }
};

// Submit a new testimonial
export const submitTestimonial = async (
  testimonial: Omit<Testimonial, "id" | "status" | "submittedAt" | "approvedAt" | "approvedBy" | "adminNote">
): Promise<Testimonial> => {
  const newTestimonial: Testimonial = {
    ...testimonial,
    id: `tst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  
  const testimonials = getStoredTestimonials();
  testimonials.unshift(newTestimonial);
  saveTestimonials(testimonials);
  
  return newTestimonial;
};

// Get testimonials by user ID
export const getUserTestimonials = async (userId: string): Promise<Testimonial[]> => {
  const testimonials = getStoredTestimonials();
  return testimonials.filter(t => t.userId === userId);
};

// Get all testimonials (admin)
export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  return getStoredTestimonials();
};

// Update testimonial status (admin)
export const updateTestimonialStatus = async (
  id: string,
  status: Testimonial["status"],
  adminNote?: string,
  approvedBy?: string
): Promise<Testimonial | null> => {
  const testimonials = getStoredTestimonials();
  const index = testimonials.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  testimonials[index] = {
    ...testimonials[index],
    status,
    adminNote: adminNote || testimonials[index].adminNote,
    ...(status === "approved" && {
      approvedAt: new Date().toISOString(),
      approvedBy,
    }),
  };
  
  saveTestimonials(testimonials);
  return testimonials[index];
};

// Delete testimonial
export const deleteTestimonial = async (id: string): Promise<boolean> => {
  const testimonials = getStoredTestimonials();
  const filtered = testimonials.filter(t => t.id !== id);
  
  if (filtered.length === testimonials.length) return false;
  
  saveTestimonials(filtered);
  return true;
};

// Get approved testimonials (public)
export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  const testimonials = getStoredTestimonials();
  return testimonials.filter(t => t.status === "approved");
};

// Edit testimonial (only pending ones)
export const editTestimonial = async (
  id: string,
  updates: Partial<Pick<Testimonial, "rating" | "title" | "message" | "showName">>
): Promise<Testimonial | null> => {
  const testimonials = getStoredTestimonials();
  const index = testimonials.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  if (testimonials[index].status !== "pending") return null;
  
  testimonials[index] = {
    ...testimonials[index],
    ...updates,
  };
  
  saveTestimonials(testimonials);
  return testimonials[index];
};
