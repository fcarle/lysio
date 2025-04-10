import { create } from 'zustand'

interface ClientContextState {
  currentCompanyId: string | null
  setCurrentCompanyId: (companyId: string) => void
}

export const useClientContext = create<ClientContextState>((set) => ({
  currentCompanyId: null,
  setCurrentCompanyId: (companyId) => set({ currentCompanyId: companyId }),
})) 