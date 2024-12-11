require('dotenv').config();
const express = require("express");
const { Pool } = require("pg");
const app = express();
const porta = process.env.PORT || 3000;

// Conexão com o banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false // Não usa SSL em localhost
    : { rejectUnauthorized: false }, // Usa SSL para ambientes remotos
});

app.use(express.json()); // Para interpretar o JSON do corpo da requisição

// Rota para salvar a compra no banco de dados
app.post("/api/salvar-compra", async (req, res) => {
  const { itens } = req.body;

  if (!itens || itens.length === 0) {
    return res.status(400).json({ erro: "Nenhum item fornecido." });
  }

  try {
    const cliente = await pool.connect();
    const consulta = `
      INSERT INTO lista_compras (nome_item, quantidade, preco)
      VALUES ($1, $2, $3)
    `;
    for (let item of itens) {
      await cliente.query(consulta, [item.nome, item.quantidade, item.preco]);
    }
    cliente.release();
    res.status(200).send("Compra salva com sucesso.");
  } catch (erro) {
    console.error("Erro ao salvar a compra:", erro);
    res.status(500).send("Erro ao salvar a compra.");
  }
});

// Rota para obter a última compra
app.get("/api/exibir-ultima-compra", async (req, res) => {
  try {
    const cliente = await pool.connect();
    const resultado = await cliente.query("SELECT * FROM lista_compras ORDER BY data_criacao DESC LIMIT 1");
    cliente.release();
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Nenhuma compra encontrada." });
    }
    res.status(200).json(resultado.rows);
  } catch (erro) {
    console.error("Erro ao buscar a última compra:", erro);
    res.status(500).send("Erro ao buscar a última compra.");
  }
});

// Inicia o servidor
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});
