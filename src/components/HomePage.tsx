import React from 'react';
import { LogOut, Home, X, FileText, MessageCircle, ShoppingCart } from 'lucide-react';
import SidebarNav, { SidebarNavItem } from './SidebarNav';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const PostsPage = React.lazy(() => import('../pages/PostsPage'));

interface HomePageProps {
  user: { email: string; name: string } | null;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('posts');
  const location = useLocation();
  const navigate = useNavigate();

  

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const navItems: SidebarNavItem[] = [
    { id: 'posts', label: 'Bài Viết', icon: FileText, path: '/posts' },
    { id: 'comments', label: 'Comment', icon: MessageCircle, path: '/comments' },
    { id: 'orders', label: 'Đơn', icon: ShoppingCart, path: '/orders' }
  ];

  React.useEffect(() => {
    const segment = location.pathname.split('/')[1] || 'posts';
    setActiveTab(segment);
  }, [location.pathname]);

  React.useEffect(() => {
    if (activeTab) {
      try {
        localStorage.setItem('lastTab', activeTab);
      } catch {
        // ignore
      }
    }
  }, [activeTab]);

  // Nội dung được render thông qua nested routes (Outlet)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0a0e1a] to-[#070b13] relative flex">
      {/* Sidebar Navigation */}
      <div className="w-48 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Quản lý</h2>
              <p className="text-sm text-gray-400">Hệ thống</p>
            </div>
          </div>
        </div>
        
        <SidebarNav
          items={navItems}
          activeId={activeTab}
          onSelect={(id) => {
            setActiveTab(id);
            const item = navItems.find((i) => i.id === id);
            if (item?.path) navigate(item.path);
          }}
        />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-xl font-bold text-white">Quản lý bán hàng</h1>
                  <p className="text-sm text-gray-400">Chào mừng trở lại!</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 bg-white/5">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 m-6 min-h-[calc(100vh-180px)] shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
            <React.Suspense
              fallback={
                <div className="p-8 text-center text-gray-400">Đang tải nội dung...</div>
              }
            >
              {/* Khi dùng nested routes, ưu tiên Outlet; fallback render theo state để giữ tương thích */}
              {location.pathname === '/' ? (
                <PostsPage />
              ) : (
                <Outlet />
              )}
            </React.Suspense>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/5 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Xác nhận đăng xuất</h3>
              <button
                onClick={handleCancelLogout}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelLogout}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;