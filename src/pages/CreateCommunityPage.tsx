import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import brain from "../brain"; // Assuming brain is in a sibling directory to pages
import useCommunityStore from "../utils/communityStore";
import { Loader2 } from "lucide-react";

export default function CreateCommunityPage() {
  const navigate = useNavigate();
  const { fetchMyCommunities } = useCommunityStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast.error("Community name and description cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      // The backend expects CommunityCreateRequest which currently has creator_id.
      // However, the endpoint logic ignores it and uses the authenticated user's ID.
      // So, we send a dummy or empty string for creator_id, or modify the backend model.
      // For now, let's align with the current CommunityCreateRequest model in data-contracts.ts
      // and assume the backend will correctly ignore the passed creator_id.
      const response = await brain.create_community({
        name,
        description,
        creator_id: "dummy-frontend-user-id", // This will be ignored by the backend
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to create community and parse error." }));
        throw new Error(errorData.detail || `HTTP error ${response.status}`);
      }
      
      const newCommunity = await response.json();

      toast.success(`Community "${name}" created successfully!`);
      await fetchMyCommunities(); // Refresh the list in the store
      navigate(`/community-forum-page?id=${newCommunity.id}`); // Navigate to the new community's forum page
    } catch (error) {
      console.error("Failed to create community:", error);
      toast.error(`Failed to create community: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="container mx-auto max-w-2xl w-full py-10">
        <Card className="shadow-xl rounded-xl w-full bg-slate-800/60 backdrop-blur-xl border border-purple-500/50">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-xl">
            <CardTitle className="text-3xl font-bold text-white drop-shadow-md">Create a New Community</CardTitle>
            <CardDescription className="text-purple-200 pt-1 drop-shadow-sm">
              Bring your vision to life and build a space for members to connect and grow.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="community-name" className="text-lg font-medium text-slate-300">Community Name</Label>
                <Input
                  id="community-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Digital Art Masters"
                  className="text-base bg-slate-700/50 border-slate-600 hover:border-purple-400/70 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder:text-slate-400 rounded-md"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="community-description" className="text-lg font-medium text-slate-300">Description</Label>
                <Textarea
                  id="community-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is your community about? Share its purpose and goals."
                  rows={5}
                  className="text-base bg-slate-700/50 border-slate-600 hover:border-purple-400/70 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder:text-slate-400 rounded-md"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400 text-white text-lg font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 ease-in-out disabled:opacity-70 border border-transparent hover:border-purple-300/50 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-60"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
                ) : (
                  "Create Community"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
