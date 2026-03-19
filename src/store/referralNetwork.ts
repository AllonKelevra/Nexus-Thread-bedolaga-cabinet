import { create } from 'zustand';
import type { SelectedNode, NetworkFilters, ScopeSelection } from '@/types/referralNetwork';

const MAX_SCOPE_ITEMS = 50;

const DEFAULT_FILTERS: NetworkFilters = {
  campaigns: [],
  partnersOnly: false,
  minReferrals: 0,
};

interface ReferralNetworkState {
  selectedNode: SelectedNode;
  hoveredNodeId: string | null;
  highlightedNodes: Set<string>;
  filters: NetworkFilters;
  scope: ScopeSelection[];

  setSelectedNode: (node: SelectedNode) => void;
  setHoveredNode: (id: string | null) => void;
  setHighlightedNodes: (nodes: Set<string>) => void;
  updateFilters: (filters: Partial<NetworkFilters>) => void;
  resetFilters: () => void;
  addScope: (item: ScopeSelection) => void;
  removeScope: (type: ScopeSelection['type'], id: number) => void;
  clearScope: () => void;
}

export const useReferralNetworkStore = create<ReferralNetworkState>()((set) => ({
  selectedNode: null,
  hoveredNodeId: null,
  highlightedNodes: new Set<string>(),
  filters: { ...DEFAULT_FILTERS },
  scope: [],

  setSelectedNode: (node) => set({ selectedNode: node }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setHighlightedNodes: (nodes) => set({ highlightedNodes: nodes }),

  updateFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  addScope: (item) =>
    set((state) => {
      const exists = state.scope.some((s) => s.type === item.type && s.id === item.id);
      if (exists) return state;
      if (state.scope.length >= MAX_SCOPE_ITEMS) return state;
      return {
        scope: [...state.scope, item],
        selectedNode: null,
        hoveredNodeId: null,
        highlightedNodes: new Set<string>(),
        filters: { ...DEFAULT_FILTERS },
      };
    }),

  removeScope: (type, id) =>
    set((state) => ({
      scope: state.scope.filter((s) => !(s.type === type && s.id === id)),
      selectedNode: null,
      hoveredNodeId: null,
      highlightedNodes: new Set<string>(),
      filters: { ...DEFAULT_FILTERS },
    })),

  clearScope: () =>
    set({
      scope: [],
      selectedNode: null,
      hoveredNodeId: null,
      highlightedNodes: new Set<string>(),
      filters: { ...DEFAULT_FILTERS },
    }),
}));
