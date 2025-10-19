import React from 'react';
import { NavLink } from 'react-router-dom';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path?: string;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ items, activeId, onSelect }) => {
  return (
    <nav className="flex-1 p-4">
      <div className="space-y-2">
        {items.map((item) => (
          item.path ? (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive || activeId === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ) : (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeId === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        ))}
      </div>
    </nav>
  );
};

export default SidebarNav;


