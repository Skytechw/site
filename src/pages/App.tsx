import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added Link
import { useCommunityDiscoveryStore } from "../utils/communityDiscoveryStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DribbbleIcon, UsersIcon, SearchIcon, PlusCircleIcon, LogInIcon, LibraryIcon, ChevronRightIcon, Loader2, AlertTriangle } from "lucide-react"; // Added icons
import { MyCommunityDetail } from "brain/data-contracts"; // For My Communities type

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredCommunities,
    myCommunities, // Added
    searchTerm,
    isLoadingAll,
    isLoadingMy, // Added
    errorAll,
    errorMy, // Added
    fetchAllCommunities,
    fetchMyCommunities, // Added
    setSearchTerm,
  } = useCommunityDiscoveryStore();

  useEffect(() => {
    fetchAllCommunities();
    fetchMyCommunities(); // Fetch user's communities
  }, [fetchAllCommunities, fetchMyCommunities]);

  const renderMyCommunityCard = (community: MyCommunityDetail) => (
    <Link to={`/communityforumpage?id=${community.id}`} key={community.id} className="block hover:no-underline group">
      <Card className="bg-slate-800/70 backdrop-blur-lg border border-purple-500/40 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-400/70 hover:bg-slate-700/60">
        <CardHeader className="bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-slate-800/30 group-hover:from-purple-600/30 group-hover:via-pink-600/20 transition-all duration-300 ease-in-out p-5">
          <CardTitle className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 group-hover:from-purple-300 group-hover:to-pink-300">
            {community.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex-grow flex flex-col justify-between">
          <CardDescription className="text-slate-400 mb-3 text-sm leading-relaxed line-clamp-3 group-hover:text-slate-300">
            {community.description || "No description available."}
          </CardDescription>
          <div className="mt-auto flex items-center justify-between text-slate-500 group-hover:text-slate-400 text-xs">
            <div className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1.5" />
                <span>{community.member_ids?.length || 0} Member{community.member_ids?.length !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <div className="container mx-auto">
        {/* Header Section - Remains the same */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 mb-4">
            <DribbbleIcon className="w-16 h-16 mr-2 text-pink-500" />
            <h1 className="text-5xl md:text-6xl font-bold">LearnSphere</h1>
          </div>
          <p className="text-xl text-slate-300 mt-2">
            Discover, Join, and Create Thriving Communities.
          </p>
        </header>

        {/* My Communities Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-semibold flex items-center">
              <LibraryIcon className="w-8 h-8 mr-3 text-purple-400" /> My Communities
            </h2>
            {/* Optional: Add a "View All" if the list becomes too long and we implement pagination for My Communities */}
          </div>
          {isLoadingMy && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl overflow-hidden text-slate-300">
                  <CardHeader className="p-5"><div className="h-6 w-3/4 bg-slate-700/50 rounded animate-pulse" /></CardHeader>
                  <CardContent className="p-5 space-y-2 pt-4">
                    <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-8 w-1/3 mt-3 bg-slate-600/50 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {errorMy && <p className="text-center text-red-400 text-lg bg-red-900/20 p-4 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2" /> Error: {errorMy}</p>}
          {!isLoadingMy && !errorMy && (
            myCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {myCommunities.map(renderMyCommunityCard)}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8 px-6 bg-slate-800/40 rounded-xl border border-slate-700">
                <UsersIcon className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-70" />
                <p className="text-xl font-semibold mb-2 text-slate-200">You haven't joined any communities yet.</p>
                <p>Explore the communities below or create your own!</p>
              </div>
            )
          )}
        </section>

        {/* Divider */}
        <hr className="border-t-2 border-slate-700 my-12 md:my-16" />

        {/* Discover All Communities Section - Title updated */}
        <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-center flex items-center justify-center">
                <SearchIcon className="w-8 h-8 mr-3 text-pink-400" /> Discover New Communities
            </h2>
            {/* Search and Create Section - Remains the same */}
            <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-center">
              <div className="relative flex-grow md:max-w-xl w-full">
                <Input
                  type="text"
                  placeholder="Search all communities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-slate-700 border-slate-600 placeholder-slate-400 text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-full"
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              <Button
                onClick={() => navigate("/CreateCommunityPage")}
                className="w-full md:w-auto text-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-150 ease-in-out transform hover:scale-105 flex items-center justify-center"
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" /> Create Community
              </Button>
            </div>

            {/* Communities Display Section - Logic remains mostly the same */}
            {isLoadingAll && (
                <div className="text-center"><Loader2 className="inline w-8 h-8 animate-spin text-pink-400" /> <span className="text-lg">Loading communities...</span></div>
            )}
            {errorAll && <p className="text-center text-red-400 text-lg"><AlertTriangle className="inline w-5 h-5 mr-2" /> Error: {errorAll}</p>}
            {!isLoadingAll && !errorAll && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map((community) => (
                    <Card 
                      key={community.id}
                      className="bg-slate-800 border-slate-700 shadow-xl rounded-xl overflow-hidden hover:shadow-pink-500/30 transition-shadow duration-300 flex flex-col justify-between"
                    >
                      <CardHeader className="p-6">
                        <CardTitle className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                          {community.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 line-clamp-3 h-[4.5rem]">
                          {community.description || "No description available."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 flex-grow">
                        <div className="flex items-center text-slate-300">
                          <UsersIcon className="w-5 h-5 mr-2 text-teal-400" />
                          <span>{community.member_count} Member{community.member_count !== 1 ? 's' : ''}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-6 bg-slate-700/50">
                        <Button 
                          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2.5 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
                          onClick={() => console.log(`Attempting to join community: ${community.id} - ${community.name}`)} // Placeholder
                        >
                          <LogInIcon className="w-4 h-4 mr-2" /> Join Community
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-slate-400 md:col-span-2 lg:col-span-3 py-10">
                    No communities found. {searchTerm && "Try a different search term!"}
                    {!searchTerm && "Perhaps create a new one?"}
                  </p>
                )}
              </div>
            )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
