import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './autenticacao/ProvedorAuth';
import LayoutPrincipal from './componentes/LayoutPrincipal';
import RotaProtegida from './componentes/RotaProtegida';
import DetalheReserva from './paginas/DetalheReserva';
import FilaGovernanca from './paginas/FilaGovernanca';
import FormularioCliente from './paginas/FormularioCliente';
import FormularioReserva from './paginas/FormularioReserva';
import ListaClientes from './paginas/ListaClientes';
import ListaFeedbacks from './paginas/ListaFeedbacks';
import ListaUsuarios from './paginas/ListaUsuarios';
import MapaQuartos from './paginas/MapaQuartos';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaRelatorios from './paginas/PaginaRelatorios';
import PaginaReservas from './paginas/PaginaReservas';
import PainelDashboard from './paginas/PainelDashboard';
import { rotaInicial } from './util/permissoes';

function RedirecionarInicio() {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? rotaInicial(usuario.papel) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PaginaLogin />} />
      <Route element={<LayoutPrincipal />}>
        <Route path="/" element={<RedirecionarInicio />} />
        <Route
          path="/dashboard"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <PainelDashboard />
            </RotaProtegida>
          }
        />
        <Route
          path="/clientes"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <ListaClientes />
            </RotaProtegida>
          }
        />
        <Route
          path="/clientes/novo"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <FormularioCliente />
            </RotaProtegida>
          }
        />
        <Route
          path="/clientes/:idCliente/editar"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <FormularioCliente />
            </RotaProtegida>
          }
        />
        <Route
          path="/quartos"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA', 'CAMAREIRA']}>
              <MapaQuartos />
            </RotaProtegida>
          }
        />
        <Route
          path="/reservas"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <PaginaReservas />
            </RotaProtegida>
          }
        />
        <Route
          path="/reservas/nova"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <FormularioReserva />
            </RotaProtegida>
          }
        />
        <Route
          path="/reservas/:idReserva"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <DetalheReserva />
            </RotaProtegida>
          }
        />
        <Route
          path="/governanca"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'CAMAREIRA']}>
              <FilaGovernanca />
            </RotaProtegida>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE']}>
              <PaginaRelatorios />
            </RotaProtegida>
          }
        />
        <Route
          path="/feedbacks"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE', 'RECEPCIONISTA']}>
              <ListaFeedbacks />
            </RotaProtegida>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RotaProtegida papeisPermitidos={['GERENTE']}>
              <ListaUsuarios />
            </RotaProtegida>
          }
        />
      </Route>
      <Route path="*" element={<RedirecionarInicio />} />
    </Routes>
  );
}
