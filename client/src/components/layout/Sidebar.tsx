import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  UserPlus, 
  FileDown, 
  X 
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div 
      className={cn(
        "bg-white border-r border-gray-200 w-full md:w-64 md:flex-shrink-0 md:block",
        open ? "block" : "hidden md:block"
      )}
    >
      <div className="p-5 border-b border-gray-200 flex justify-between items-center md:justify-center">
        <h1 className="text-xl font-semibold text-primary">Member Registry</h1>
        <button onClick={onClose} className="md:hidden">
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <Link 
              href="/"
              onClick={onClose} 
              className={cn(
                "flex items-center p-2 rounded-md",
                isActive("/") ? "bg-blue-50 text-primary" : "hover:bg-gray-50"
              )}
            >
              <LayoutDashboard className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/add"
              onClick={onClose}  
              className={cn(
                "flex items-center p-2 rounded-md",
                isActive("/add") ? "bg-blue-50 text-primary" : "hover:bg-gray-50"
              )}
            >
              <UserPlus className="h-5 w-5 mr-3" />
              Add Member
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/export"
              onClick={onClose}  
              className={cn(
                "flex items-center p-2 rounded-md",
                isActive("/export") ? "bg-blue-50 text-primary" : "hover:bg-gray-50"
              )}
            >
              <FileDown className="h-5 w-5 mr-3" />
              Export Data
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
