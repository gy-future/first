
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { t } from "@/components/i18n";
import { Home, Trophy, User, BookOpen, Target } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const isActive = (pageName) => {
    const url = createPageUrl(pageName);
    // 特殊处理，当在主题详情页时，也高亮学习图标
    if (pageName === 'Learning') {
      return location.pathname === url || location.pathname.startsWith(createPageUrl('TopicDetail'));
    }
    return location.pathname === url;
  };

  const navItems = [
    { name: t('common.home'), page: "Home", icon: Home },
    { name: t('common.learning'), page: "Learning", icon: BookOpen },
    { name: t('common.training'), page: "TrainingHub", icon: Target },
    { name: t('common.leaderboard'), page: "Leaderboard", icon: Trophy },
    { name: t('common.profile'), page: "Profile", icon: User }
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
          
          /* 移动端优化 */
          * {
            touch-action: manipulation;
          }
          
          /* 防止iOS双击缩放 */
          button, a {
            touch-action: manipulation;
          }
          
          /* 优化滚动 */
          html {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
        `}
      </style>
      
      <main className="pb-20 min-h-screen">
        {children}
      </main>

      {/* 底部导航栏 - 移动端优化 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/60 px-2 py-2 z-50 safe-area-inset-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all duration-200 min-w-0 ${
                isActive(item.page)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 active:bg-slate-100'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${
                isActive(item.page) ? 'text-blue-600' : 'text-slate-500'
              }`} />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
