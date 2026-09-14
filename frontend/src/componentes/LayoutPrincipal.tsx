import { useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../autenticacao/ProvedorAuth';
import { DESTINOS_MENU, rotaInicial } from '../util/permissoes';
import { rotuloPapel } from '../util/rotulos';
import IndicadorCarregamento from './IndicadorCarregamento';
import MarcaHotel from './MarcaHotel';

export default function LayoutPrincipal() {
  const { autenticado, carregandoSessao, usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const local = useLocation();

  if (carregandoSessao) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <IndicadorCarregamento rotulo="Preparando a recepção..." />
      </div>
    );
  }

  if (!autenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  const destinos = DESTINOS_MENU.filter((destino) => destino.papeis.includes(usuario.papel));

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-[#EBEBEB] bg-white">
        <div className="mx-auto flex h-20 max-w-[1760px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-[#DDDDDD] px-3 py-1.5 text-sm lg:hidden"
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              Menu
            </button>
            <Link
              to={rotaInicial(usuario.papel)}
              className="min-w-0 rounded-xl outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#FF385C]/40"
              aria-label="Voltar ao início"
            >
              <MarcaHotel compacta />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {destinos.map((destino) => {
              const ativo =
                local.pathname === destino.para || local.pathname.startsWith(`${destino.para}/`);
              return (
                <NavLink
                  key={destino.para}
                  to={destino.para}
                  className={`relative px-3 py-2 text-sm transition ${
                    ativo ? 'font-semibold text-[#222222]' : 'font-medium text-[#222222] hover:text-black'
                  }`}
                >
                  {destino.rotulo}
                  {ativo ? (
                    <span className="absolute inset-x-3 -bottom-[22px] h-[2px] rounded-full bg-[#222222]" />
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="truncate text-sm font-semibold text-[#222222]">{usuario.nome}</p>
              <p className="text-xs text-[#717171]">{rotuloPapel(usuario.papel)}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-[#DDDDDD] px-4 py-2 text-sm font-medium text-[#222222] hover:bg-[#F7F7F7]"
              onClick={sair}
            >
              Sair
            </button>
          </div>
        </div>

        {menuAberto ? (
          <nav className="border-t border-[#EBEBEB] bg-white px-4 py-3 lg:hidden" aria-label="Principal móvel">
            <div className="flex flex-col">
              {destinos.map((destino) => (
                <NavLink
                  key={destino.para}
                  to={destino.para}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-sm ${
                      isActive ? 'bg-[#F7F7F7] font-semibold' : 'font-medium text-[#222222]'
                    }`
                  }
                >
                  {destino.rotulo}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-[1760px] px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
