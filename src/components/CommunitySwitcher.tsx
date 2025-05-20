import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check, PlusCircle, Loader2 } from "lucide-react"; // Added Loader2
import useCommunityStore from "../utils/communityStore"; // Corrected path
import { CommunityResponse } from "../brain/data-contracts"; // Corrected path

export default function CommunitySwitcher() {
  const navigate = useNavigate();
  const {
    myCommunities,
    isLoadingMyCommunities,
    setSelectedCommunityId, // Added from store
  } = useCommunityStore();

  const [selectedCommunityDisplay, setSelectedCommunityDisplay] = useState<CommunityResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Update display if the store's selected ID changes or myCommunities list updates
    const currentSelectionFromStore = myCommunities.find(c => c.id === useCommunityStore.getState().selectedCommunityId);
    if (currentSelectionFromStore) {
      setSelectedCommunityDisplay(currentSelectionFromStore);
    } else {
      setSelectedCommunityDisplay(null);
    }
  }, [myCommunities, useCommunityStore.getState().selectedCommunityId]); // Re-run if myCommunities or selectedCommunityId in store changes
  
  // Effect to set the initial selected community display when communities load
  // and to sync if the selectedCommunityId in store is already set (e.g. on page load)
  useEffect(() => {
    if (!isLoadingMyCommunities && myCommunities.length > 0) {
        const initiallySelected = myCommunities.find(c => c.id === useCommunityStore.getState().selectedCommunityId);
        if (initiallySelected) {
            setSelectedCommunityDisplay(initiallySelected);
        } else if (!selectedCommunityDisplay) {
            // If nothing is selected in store, and nothing displayed, keep it that way or select first one if desired
            // For now, keep it null to show "Select Community..."
        }
    } else if (!isLoadingMyCommunities && myCommunities.length === 0) {
        setSelectedCommunityDisplay(null);
    }
}, [myCommunities, isLoadingMyCommunities, selectedCommunityDisplay]);


  const handleSelectCommunity = (community: CommunityResponse) => {
    setSelectedCommunityDisplay(community); // Update local display for the button text
    setIsOpen(false);
    navigate(`/community-forum-page?id=${community.id}`); // Navigate to CommunityForumPage with id as query param
  };

  const handleCreateNewCommunity = () => {
    navigate("/create-community-page");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[230px] justify-between font-medium text-slate-200 bg-slate-700/50 hover:bg-slate-600/70 border border-slate-600 hover:border-purple-500/70 shadow-sm hover:shadow-md transition-all duration-150 ease-in-out focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg"
        >
          {isLoadingMyCommunities ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : selectedCommunityDisplay ? (
            selectedCommunityDisplay.name
          ) : (
            "Select Community..."
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-70 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[230px] p-1 shadow-xl rounded-lg border border-purple-500/70 bg-slate-800/95 backdrop-blur-xl text-slate-200">
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Your Communities</DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-1 my-1 bg-purple-500/40" />
        {isLoadingMyCommunities ? (
          <DropdownMenuItem disabled className="text-sm text-slate-400 m-0.5 px-2 py-1.5 flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </DropdownMenuItem>
        ) : myCommunities.length === 0 ? (
          <DropdownMenuItem disabled className="text-sm text-gray-500 m-0.5">
            No communities found.
          </DropdownMenuItem>
        ) : (
          myCommunities.map((community) => (
            <DropdownMenuItem
              key={community.id}
              onSelect={() => handleSelectCommunity(community)}
              className="text-sm text-slate-300 rounded-md hover:!bg-purple-600/60 hover:!text-white data-[highlighted]:bg-purple-600/50 data-[highlighted]:text-white cursor-pointer m-0.5 px-2 py-1.5 flex items-center"
            >
              <Check
                className={`mr-2 h-4 w-4 ${selectedCommunityDisplay?.id === community.id ? "opacity-100 text-purple-400" : "opacity-0"}`}
              />
              {community.name}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator className="mx-1 my-1"/>
        <DropdownMenuItem 
          onSelect={handleCreateNewCommunity} 
          className="text-sm text-pink-400 font-medium rounded-md hover:!bg-pink-600/40 hover:!text-pink-200 data-[highlighted]:bg-pink-600/30 data-[highlighted]:!text-pink-200 cursor-pointer m-0.5 flex items-center px-2 py-1.5"
        >
          <PlusCircle className="mr-2 h-5 w-5 text-pink-400" />
          Create New Community
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
