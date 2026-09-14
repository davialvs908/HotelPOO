import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { mensagemDeErro } from '../api/apiCliente';
import { useAuth } from '../autenticacao/ProvedorAuth';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import MarcaHotel from '../componentes/MarcaHotel';
import { FOTO_HOTEL_EDITORIAL, FOTO_QUARTO_FALLBACK } from '../util/fotosQuarto';
import { rotaInicial } from '../util/permissoes';
import { NOME_HOTEL } from '../util/rotulos';

export default function PaginaLogin() {
  const { autenticado, usuario, entrar } = useAuth();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [fotoFundo, setFotoFundo] = useState(FOTO_HOTEL_EDITORIAL);

  if (autenticado && usuario) {
    return <Navigate to={rotaInicial(usuario.papel)} replace />;
  }

  const formularioValido = login.trim().length > 0 && senha.trim().length > 0;

  async function aoEntrar(evento: FormEvent) {
    evento.preventDefault();
    if (!formularioValido || enviando) {
      return;
    }
    setEnviando(true);
    setMensagemErro('');
    try {
      await entrar(login.trim(), senha);
    } catch (erro) {
      setMensagemErro(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <img
          src={fotoFundo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFotoFundo(FOTO_QUARTO_FALLBACK)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <MarcaHotel variante="claro" />
          <div className="max-w-lg">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">{NOME_HOTEL}</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-white/90">
              Recepção, quartos, governança e folio no mesmo lugar, com o tom de quem resolve o dia
              com o que tem.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-white px-4 py-10">
        <form onSubmit={aoEntrar} className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <MarcaHotel />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#222222]">Entrar</h2>
          <p className="mt-2 text-[15px] text-[#717171]">
            Use o login da recepção, da gerência ou da governança.
          </p>

          <div className="mt-8 space-y-4">
            <CampoFormulario
              rotulo="Login"
              valor={login}
              aoAlterar={setLogin}
              autoComplete="username"
              placeholder="Seu login"
            />
            <CampoFormulario
              rotulo="Senha"
              valor={senha}
              aoAlterar={setSenha}
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
            />
          </div>

          <div className="mt-4">
            <Alerta mensagem={mensagemErro} />
          </div>

          <BotaoAcao type="submit" className="mt-6 w-full" disabled={!formularioValido || enviando}>
            {enviando ? 'Entrando...' : 'Continuar'}
          </BotaoAcao>
        </form>
      </section>
    </div>
  );
}
