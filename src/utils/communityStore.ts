import { create } from "zustand";
import brain from "../brain"; // Assuming brain is in a sibling directory
import { CommunityResponse } from "../brain/data-contracts";

interface CommunityStoreState {
  myCommunities: CommunityResponse[];
  isLoadingMyCommunities: boolean;
  errorMyCommunities: Error | null;
  selectedCommunityId: string | null; // Added for MYA-13
  fetchMyCommunities: () => Promise<void>;
  setSelectedCommunityId: (id: string | null) => void; // Added for MYA-13
  // TODO: Add methods for creating, joining, leaving communities if needed later
}

const useCommunityStore = create<CommunityStoreState>((set) => ({
  myCommunities: [],
  isLoadingMyCommunities: false,
  errorMyCommunities: null,
  selectedCommunityId: null, // Added for MYA-13

  fetchMyCommunities: async () => {
    set({ isLoadingMyCommunities: true, errorMyCommunities: null });
    try {
      // The actual brain method name might be different after generation,
      // e.g., listMyCommunities, getMyCommunities, etc.
      // Based on inspect_api, it should be list_my_communities
      const httpResponse = await brain.list_my_communities(); 
      
      if (!httpResponse.ok) {
        const errorData = await httpResponse.json().catch(() => ({ detail: "Failed to parse error from fetching communities." }));
        throw new Error(errorData.detail || `HTTP error ${httpResponse.status}`);
      }

      const data: CommunityResponse[] = await httpResponse.json();
      set({ myCommunities: data, isLoadingMyCommunities: false });
      console.log("Fetched my communities:", data);
    } catch (error) {
      console.error("Failed to fetch my communities:", error);
      set({ errorMyCommunities: error as Error, isLoadingMyCommunities: false });
    }
  },
  // Added for MYA-13
  setSelectedCommunityId: (id: string | null) => set({ selectedCommunityId: id }),
}));

export default useCommunityStore;
