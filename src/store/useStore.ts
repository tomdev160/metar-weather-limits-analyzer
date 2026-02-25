import { create } from 'zustand';
import { WeatherLimit, ParsedMETAR } from '../types';

interface AppState {
  limits: WeatherLimit[];
  metarData: ParsedMETAR[];
  selectedAirport: string;
  selectedLimitId: string | null;
  isProcessing: boolean;
  processingProgress: number;
  activeView: 'limits' | 'upload' | 'dashboard';
  addLimit: (limit: WeatherLimit) => void;
  updateLimit: (limit: WeatherLimit) => void;
  deleteLimit: (id: string) => void;
  setMetarData: (data: ParsedMETAR[]) => void;
  setIsProcessing: (val: boolean) => void;
  setProcessingProgress: (val: number) => void;
  setSelectedAirport: (airport: string) => void;
  setSelectedLimitId: (id: string | null) => void;
  setActiveView: (view: 'limits' | 'upload' | 'dashboard') => void;
}

export const useStore = create<AppState>((set) => ({
  limits: [],
  metarData: [],
  selectedAirport: 'EHAM',
  selectedLimitId: null,
  isProcessing: false,
  processingProgress: 0,
  activeView: 'limits',
  addLimit: (limit) => set((state) => ({ limits: [...state.limits, limit] })),
  updateLimit: (limit) =>
    set((state) => ({
      limits: state.limits.map((l) => (l.id === limit.id ? limit : l)),
    })),
  deleteLimit: (id) =>
    set((state) => ({ limits: state.limits.filter((l) => l.id !== id) })),
  setMetarData: (data) => set({ metarData: data }),
  setIsProcessing: (val) => set({ isProcessing: val }),
  setProcessingProgress: (val) => set({ processingProgress: val }),
  setSelectedAirport: (airport) => set({ selectedAirport: airport }),
  setSelectedLimitId: (id) => set({ selectedLimitId: id }),
  setActiveView: (view) => set({ activeView: view }),
}));
