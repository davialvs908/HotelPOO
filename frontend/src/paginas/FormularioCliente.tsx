import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiCliente, mensagemDeErro } from '../api/apiCliente';
import Alerta from '../componentes/Alerta';
import BotaoAcao from '../componentes/BotaoAcao';
import CampoFormulario from '../componentes/CampoFormulario';
import IndicadorCarregamento from '../componentes/IndicadorCarregamento';
import { useToast } from '../componentes/ProvedorToast';
import type { ClienteHotel } from '../tipos/dominio';
import { emailPareceValido } from '../util/formatacao';

export default function FormularioCliente() {
  const { idCliente } = useParams();
  const navigate = useNavigate();
  const { avisar, avisarErro } = useToast();
  const editando = Boolean(idCliente);

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [enviando, setEnviando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    if (!idCliente) {
      return;
    }
    let ativo = true;
    (async () => {
      try {
        const cliente = await apiCliente.get<ClienteHotel>(`/api/clientes/${idCliente}`);
        if (!ativo) {
          return;
        }
        setNome(cliente.nome ?? '');
        setDocumento(cliente.documento ?? '');
        setTelefone(cliente.telefone ?? '');
        setEmail(cliente.email ?? '');
      } catch (erro) {
        if (ativo) {
          setMensagemErro(mensagemDeErro(erro));
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    })();
    return () => {
      ativo = false;
    };
  }, [idCliente]);

  const emailInvalido = !emailPareceValido(email);
  const formularioValido =
    nome.trim().length > 1 && documento.trim().length >= 5 && !emailInvalido;

  async function aoSalvar(evento: FormEvent) {
    evento.preventDefault();
    if (!formularioValido || enviando) {
      return;
    }
    setEnviando(true);
    setMensagemErro('');
    const corpo = {
      nome: nome.trim(),
      documento: documento.trim(),
      telefone: telefone.trim() || undefined,
      email: email.trim() || undefined,
    };
    try {
      if (editando && idCliente) {
        await apiCliente.put(`/api/clientes/${idCliente}`, corpo);
        avisar('Ficha do cliente atualizada.');
      } else {
        await apiCliente.post('/api/clientes', corpo);
        avisar('Cliente cadastrado.');
      }
      navigate('/clientes');
    } catch (erro) {
      const texto = mensagemDeErro(erro);
      setMensagemErro(texto);
      avisarErro(texto);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return <IndicadorCarregamento rotulo="Abrindo a ficha..." />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="titulo-pagina">{editando ? 'Editar cliente' : 'Novo cliente'}</h1>
        <p className="subtitulo-pagina">Nome e documento identificam o hóspede na reserva e no folio.</p>
      </header>

      <form onSubmit={aoSalvar} className="cartao space-y-4 p-6">
        <CampoFormulario rotulo="Nome completo" valor={nome} aoAlterar={setNome} required />
        <CampoFormulario
          rotulo="Documento"
          valor={documento}
          aoAlterar={setDocumento}
          placeholder="CPF ou passaporte"
          required
        />
        <CampoFormulario rotulo="Telefone" valor={telefone} aoAlterar={setTelefone} />
        <CampoFormulario
          rotulo="E-mail"
          valor={email}
          aoAlterar={setEmail}
          type="email"
          mensagemErro={emailInvalido ? 'Informe um e-mail com @ e domínio, ou deixe em branco.' : undefined}
        />

        <Alerta mensagem={mensagemErro} />

        <div className="flex flex-wrap gap-3 pt-2">
          <BotaoAcao type="submit" disabled={!formularioValido || enviando}>
            {enviando ? 'Salvando...' : 'Salvar'}
          </BotaoAcao>
          <Link to="/clientes">
            <BotaoAcao variante="secundario">Cancelar</BotaoAcao>
          </Link>
        </div>
      </form>
    </div>
  );
}
