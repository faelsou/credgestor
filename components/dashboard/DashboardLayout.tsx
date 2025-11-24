import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Home, Users, DollarSign, Calendar, LogOut, Menu, X, Shield, Briefcase } from 'lucide-react';
import { cn } from '../../utils';
import { UserRole } from '../../types';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, view, setView } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        setView(id);
        setSidebarOpen(false);
      }}
      className={cn(
        "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1",
        view === id 
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
      )}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-emerald-600 tracking-tight">CredGestor</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6 px-4">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Menu Principal</p>
            <NavItem id="home" icon={Home} label="Dashboard" />
            <NavItem id="clients" icon={Users} label="Clientes" />
            <NavItem id="loans" icon={DollarSign} label="Empréstimos" />
            <NavItem id="installments" icon={Calendar} label="Parcelas" />
          </div>

          {user?.role === UserRole.ADMIN && (
            <div className="mb-6 px-4">
               <p className="text-xs font-bold text-slate-400 uppercase mb-2">Administração</p>
               <NavItem id="users" icon={Shield} label="Equipe / Acessos" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                {user?.role === UserRole.ADMIN ? <Shield size={10}/> : <Briefcase size={10}/>}
                {user?.role === UserRole.ADMIN ? 'Administrador' : 'Cobrador'}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800 lg:hidden">
            {view === 'home' ? 'Dashboard' : view.charAt(0).toUpperCase() + view.slice(1)}
          </h1>
          <div className="hidden lg:block text-slate-400 text-sm">
             {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};