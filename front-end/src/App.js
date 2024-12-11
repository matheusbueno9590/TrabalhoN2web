import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [nomeItem, setNomeItem] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [listaItens, setListaItens] = useState([]);
  const [ultimaCompra, setUltimaCompra] = useState(null);
  const [exibirUltimaCompra, setExibirUltimaCompra] = useState(false);

  const adicionarItem = () => {
    if (!nomeItem || !quantidade || !preco) {
      alert("Preencha todos os campos para adicionar um item.");
      return;
    }
    const novoItem = { nome: nomeItem, quantidade, preco };
    setListaItens([...listaItens, novoItem]);
    setNomeItem("");
    setQuantidade("");
    setPreco("");
  };

  const limparLista = () => {
    setListaItens([]);
  };

  const salvarNoBanco = async () => {
    if (listaItens.length === 0) {
      alert("A lista está vazia. Adicione itens antes de efetuar a compra.");
      return;
    }

    try {
      const resposta = await fetch("/api/salvar-compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itens: listaItens,
        }),
      });

      if (resposta.ok) {
        setUltimaCompra(listaItens); // Salva a compra como última compra
        setListaItens([]); // Limpa a lista
        alert("Compra efetuada com sucesso!");
      } else {
        const dados = await resposta.json();
        alert(`Erro: ${dados.erro || "Não foi possível salvar a compra."}`);
      }
    } catch (erro) {
      console.error("Erro ao salvar a compra:", erro);
      alert("Erro ao salvar a compra.");
    }
  };

  const handleExibirUltimaCompra = async () => {
    if (!ultimaCompra) {
      alert("Nenhuma compra registrada ainda.");
      return;
    }
    setExibirUltimaCompra(true); // Atualiza o estado para exibir a última compra
  };

  return (
    <div className="app-container">
      <h1>Lista de Compras</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Nome do item"
          value={nomeItem}
          onChange={(e) => setNomeItem(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
        <input
          type="number"
          placeholder="Valor"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
      </div>
      <div className="button-container">
        <button onClick={adicionarItem}>Adicionar Item</button>
        <button onClick={limparLista}>Limpar Lista</button>
        <button onClick={salvarNoBanco}>Efetuar Compra</button>
        <button onClick={handleExibirUltimaCompra}>Exibir Última Compra</button>
      </div>
      <h2>Itens da Lista:</h2>
      {listaItens.length === 0 ? (
        <p>A lista está vazia.</p>
      ) : (
        <ul className="item-list">
          {listaItens.map((item, index) => (
            <li key={index}>
              {item.nome} - {item.quantidade} unidades - R$ {item.preco}
            </li>
          ))}
        </ul>
      )}
      {exibirUltimaCompra && ultimaCompra && (
        <>
          <h2>Última Compra:</h2>
          <ul className="last-purchase">
            {ultimaCompra.map((item, index) => (
              <li key={index}>
                {item.nome} - {item.quantidade} unidades - R$ {item.preco}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
