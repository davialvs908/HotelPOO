import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../autenticacao/ProvedorAuth';
import type { PapelUsuario } from '../tipos/dominio';
import { rotaInicial } from '../util/permissoes';
import IndicadorCarregamento from './IndicadorCarregamento';

type Propriedades = {
  children: ReactNode;
  papeisPermitidos: PapelUsuario[];
};

export default function RotaProtegida({ children, papeisPermitidos }: Propriedades) {
  const { autenticado, carregandoSessao, usuario } = useAuth();

  if (carregandoSessao) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <IndicadorCarregamento rotulo="Abrindo o hotel..." />
      </div>
    );
  }

  if (!autenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!papeisPermitidos.includes(usuario.papel)) {
    return <Navigate to={rotaInicial(usuario.papel)} replace />;
  }

  return <>{children}</>;
}
