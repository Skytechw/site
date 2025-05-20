import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollText, BookOpenText, CalendarDays, Users } from "lucide-react"; // Icons for tabs

export default function CommunityTabs() {
  // In the future, tab content could be more complex components
  // passed as children or determined by routing/state.

  const tabItems = [
    {
      value: "feed",
      label: "Community Feed",
      icon: ScrollText,
      content: "Recent posts, discussions, and announcements from the community will appear here. Engage with others, share your thoughts, and stay updated!",
    },
    {
      value: "classroom",
      label: "Classroom",
      icon: BookOpenText,
      content: "Browse courses, track your learning progress, and access educational materials. This is your hub for structured learning within the community.",
    },
    {
      value: "calendar",
      label: "Calendar & Events",
      icon: CalendarDays,
      content: "View upcoming community events, workshops, Q&A sessions, and scheduled bookings with creators. Stay organized and never miss an important date!",
    },
    {
      value: "members",
      label: "Members Directory",
      icon: Users,
      content: "Connect with other members of this community. View profiles, send messages (future feature), and build your network.",
    },
  ];

  return (
    <Tabs defaultValue={tabItems[0].value} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-purple-50 rounded-lg p-1">
        {tabItems.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className="flex-1 data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md text-slate-600 hover:text-purple-600 transition-all duration-150 ease-in-out items-center gap-2 py-2.5"
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabItems.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="p-1">
          <div className="p-6 bg-white rounded-lg shadow-inner border border-slate-100 min-h-[200px]">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">{tab.label}</h3>
            <p className="text-slate-600 leading-relaxed">{tab.content}</p>
            {/* More detailed placeholder or actual component can go here */}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
