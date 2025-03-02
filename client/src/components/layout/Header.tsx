import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex justify-between items-center">
        <button onClick={onMenuClick} className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <span className="text-sm text-gray-500">Welcome Admin</span>
        </div>
      </div>
    </header>
  );
}
