import { create } from "zustand";
import brain from "brain";
import { CommunityBasicInfo, CommunityListResponse, MyCommunityDetail } from "brain/data-contracts";

interface CommunityDiscoveryState {
  allCommunities: CommunityBasicInfo[];
  filteredCommunities: CommunityBasicInfo[];
  myCommunities: MyCommunityDetail[]; // Added for user's communities
  searchTerm: string;
  isLoadingAll: boolean; // Renamed for clarity
  isLoadingMy: boolean; // Added for clarity
  errorAll: string | null; // Renamed for clarity
  errorMy: string | null; // Added for clarity
  fetchAllCommunities: () => Promise<void>;
  fetchMyCommunities: () => Promise<void>; // Added
  setSearchTerm: (term: string) => void;
}

export const useCommunityDiscoveryStore = create<CommunityDiscoveryState>((set, get) => ({
  allCommunities: [],
  filteredCommunities: [],
  myCommunities: [], // Initialize
  searchTerm: "",
  isLoadingAll: false,
  isLoadingMy: false, // Initialize
  errorAll: null,
  errorMy: null, // Initialize

  fetchAllCommunities: async () => {
    set({ isLoadingAll: true, errorAll: null });
    try {
      const response = await brain.list_all_communities();
      const data: CommunityListResponse = await response.json();
      set({
        allCommunities: data.communities,
        filteredCommunities: data.communities, // Initialize filtered with all
        isLoadingAll: false,
      });
      // When all communities are fetched, also apply current search term if any
      const currentSearchTerm = get().searchTerm;
      if (currentSearchTerm.trim() !== "") {
        const lowerCaseTerm = currentSearchTerm.toLowerCase();
        const filtered = data.communities.filter((community) =>
          community.name.toLowerCase().includes(lowerCaseTerm) ||
          (community.description && community.description.toLowerCase().includes(lowerCaseTerm))
        );
        set({ filteredCommunities: filtered });
      }

    } catch (err) {
      console.error("Error fetching all communities:", err);
      let errorMessage = "Failed to fetch all communities.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      set({ errorAll: errorMessage, isLoadingAll: false });
    }
  },

  fetchMyCommunities: async () => {
    set({ isLoadingMy: true, errorMy: null });
    try {
      const response = await brain.list_my_communities(); 
      // Assuming list_my_communities returns HttpResponse with MyCommunityDetail[]
      // Need to check actual return type from brain client if different
      const data: MyCommunityDetail[] = await response.json(); 
      set({
        myCommunities: data,
        isLoadingMy: false,
      });
    } catch (err) {
      console.error("Error fetching my communities:", err);
      let errorMessage = "Failed to fetch your communities.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      set({ errorMy: errorMessage, isLoadingMy: false });
    }
  },

  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    const currentAllCommunities = get().allCommunities;
    if (term.trim() === "") {
      set({ filteredCommunities: currentAllCommunities });
    } else {
      const lowerCaseTerm = term.toLowerCase();
      const filtered = currentAllCommunities.filter((community) =>
        community.name.toLowerCase().includes(lowerCaseTerm) ||
        (community.description && community.description.toLowerCase().includes(lowerCaseTerm))
      );
      set({ filteredCommunities: filtered });
    }
  },
}));
