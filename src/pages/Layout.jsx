
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Trophy, User, BookOpen, Target } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const isActive = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  const navItems = [
    { name: "首页", page: "Home", icon: Home },
    { name: "学习", page: "Learning", icon: BookOpen },
    { name: "训练", page: "TrainingHub", icon: Target },
    { name: "排行榜", page: "Leaderboard", icon: Trophy },
    { name: "我的", page: "Profile", icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <style>
        {`
          :root {
            --primary-blue: #1e40af;
            --primary-blue-light: #3b82f6;
            --accent-orange: #f97316;
            --accent-orange-light: #fb923c;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --surface: #ffffff;
            --surface-elevated: #f8fafc;
          }
        `}
      </style>
      
      <main className="pb-20">
        {children}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/60 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 ${
                isActive(item.page)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${
                isActive(item.page) ? 'text-blue-600' : 'text-slate-500'
              }`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
