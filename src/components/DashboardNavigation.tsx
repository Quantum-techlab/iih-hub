
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Users } from "lucide-react";

const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    onClick={onClick}
    className={`flex items-center space-x-2 ${
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
        : "text-gray-600 hover:text-gray-900"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </Button>
);

const DashboardNavigation = ({ user, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100/50 rounded-lg w-fit">
      {user.role === "admin" ? (
        <>
          <TabButton
            id="admin"
            icon={Users}
            label="Admin Panel"
            isActive={activeTab === "admin"}
            onClick={() => setActiveTab("admin")}
          />
          <TabButton
            id="profile"
            icon={User}
            label="Profile"
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </>
      ) : (
        <>
          <TabButton
            id="overview"
            icon={Calendar}
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <TabButton
            id="history"
            icon={Clock}
            label="History"
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
          <TabButton
            id="profile"
            icon={User}
            label="Profile"
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
        </>
      )}
    </div>
  );
};

export default DashboardNavigation;
