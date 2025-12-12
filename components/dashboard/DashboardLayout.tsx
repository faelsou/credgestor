import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Home, Users, DollarSign, Calendar, LogOut, Menu, Shield, Briefcase, MoonStar, Eclipse } from 'lucide-react';
import { cn } from '../../utils';
import { ThemeMode, UserRole } from '../../types';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, view, setView, theme, setTheme } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const themeOptions: { id: ThemeMode; label: string; description: string }[] = [
    { id: 'light', label: 'Claro', description: 'Visual padrão' },
    { id: 'dark-emerald', label: 'Dark Esmeralda', description: 'Contraste suave' },
    { id: 'dark-contrast', label: 'Dark Alto Contraste', description: 'Mais brilho' }
  ];

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
          : theme === 'light'
            ? "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
            : "text-slate-200 hover:bg-white/5 hover:text-emerald-100"
      )}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </button>
  );

  return (
    <div className={cn(
      "min-h-screen flex transition-colors",
      theme === 'light' ? 'bg-slate-50 text-slate-900' : theme === 'dark-emerald' ? 'bg-[#0b1220] text-slate-100' : 'bg-[#0c0c0d] text-slate-50'
    )}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        theme === 'light'
          ? 'bg-white border-slate-200'
          : theme === 'dark-emerald'
            ? 'bg-slate-900/70 border-slate-800 text-slate-100 backdrop-blur'
            : 'bg-neutral-900 border-neutral-800 text-slate-100'
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <span className="text-xl font-bold text-emerald-400 tracking-tight">CredGestor</span>
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

        <div className={cn(
          "p-4 border-t",
          theme === 'light' ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800 bg-white/5'
        )}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={cn('text-sm font-bold truncate', theme === 'light' ? 'text-slate-900' : 'text-slate-100')}>{user?.name}</p>
              <p className={cn('text-xs truncate flex items-center gap-1', theme === 'light' ? 'text-slate-500' : 'text-slate-400')}>
                {user?.role === UserRole.ADMIN ? <Shield size={10}/> : <Briefcase size={10}/>}
                {user?.role === UserRole.ADMIN ? 'Administrador' : 'Cobrador'}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[11px] text-slate-400 uppercase font-semibold mb-2">Tema</p>
              <div className="space-y-2">
                {themeOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition",
                      theme === option.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-transparent text-slate-200 hover:bg-white/5'
                    )}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      {option.id === 'light' ? <Eclipse size={16} /> : <MoonStar size={16} />}
                      <div className="text-left">
                        <p className="font-semibold leading-tight">{option.label}</p>
                        <p className="text-[11px] opacity-70">{option.description}</p>
                      </div>
                    </div>
                    {theme === option.id && <span className="text-[10px] uppercase tracking-wide">Ativo</span>}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-200 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={cn(
          "border-b h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30",
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-slate-800'
        )}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-800 lg:hidden">
            {view === 'home' ? 'Dashboard' : view.charAt(0).toUpperCase() + view.slice(1)}
          </h1>
          <div className="hidden lg:flex items-center gap-4 text-sm text-slate-400">
             <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
             <div className="hidden xl:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
               {themeOptions.filter(t => t.id !== 'light').map(option => (
                 <button
                   key={option.id}
                   onClick={() => setTheme(option.id)}
                   className={cn(
                     "text-xs font-semibold px-2 py-1 rounded-full transition",
                     theme === option.id ? 'bg-emerald-600 text-white' : 'text-slate-200 hover:bg-white/10'
                   )}
                 >
                   {option.id === 'dark-emerald' ? 'Dark 1' : 'Dark 2'}
                 </button>
               ))}
             </div>
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