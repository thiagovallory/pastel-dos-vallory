const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Banco de dados SQLite
const dbPath = path.join(__dirname, 'pastel.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feito INTEGER DEFAULT 0,
    criado_UTC DATETIME DEFAULT CURRENT_TIMESTAMP,
    pronto_UTC DATETIME
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sabores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    valor INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER,
    sabor_id INTEGER,
    quantidade INTEGER,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (sabor_id) REFERENCES sabores(id)
  )`);
});

// Criar novo pedido
app.post('/api/pedidos', (req, res) => {
  // Espera receber: { sabor_1: 2, sabor_2: 0, sabor_3: 1, ... }
  const sabores = Object.entries(req.body)
    .filter(([k, v]) => k.startsWith('sabor_') && Number(v) > 0)
    .map(([k, v]) => ({
      sabor_id: Number(k.replace('sabor_', '')),
      quantidade: Number(v)
    }));
  if (sabores.length === 0) return res.status(400).json({ error: 'Nenhum sabor selecionado' });
  
  // Primeiro, buscar os valores dos sabores para calcular o total
  const saborIds = sabores.map(s => s.sabor_id);
  db.all(`SELECT id, valor FROM sabores WHERE id IN (${saborIds.map(() => '?').join(',')})`, saborIds, (err, saboresInfo) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Calcular valor total
    const valorTotal = sabores.reduce((total, s) => {
      const saborInfo = saboresInfo.find(info => info.id === s.sabor_id);
      return total + (s.quantidade * (saborInfo?.valor || 0));
    }, 0);
    
    // Criar o pedido com o valor total
    db.run(
      `INSERT INTO pedidos (feito, valor_total) VALUES (0, ?)`,
      [valorTotal],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const pedidoId = this.lastID;
        const stmt = db.prepare('INSERT INTO itens_pedido (pedido_id, sabor_id, quantidade, valor_unitario) VALUES (?, ?, ?, ?)');
        for (const s of sabores) {
          const saborInfo = saboresInfo.find(info => info.id === s.sabor_id);
          const valorUnitario = saborInfo?.valor || 0;
          stmt.run(pedidoId, s.sabor_id, s.quantidade, valorUnitario);
        }
        stmt.finalize((err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: pedidoId, valor_total: valorTotal });
        });
      }
    );
  });
});

// Listar todos os pedidos
app.get('/api/pedidos', (req, res) => {
  db.all('SELECT * FROM pedidos ORDER BY criado_UTC DESC', [], (err, pedidos) => {
    if (err) return res.status(500).json({ error: err.message });
    if (pedidos.length === 0) return res.json([]);
    const pedidoIds = pedidos.map(p => p.id);
    db.all(`SELECT * FROM itens_pedido WHERE pedido_id IN (${pedidoIds.map(() => '?').join(',')})`, pedidoIds, (err, itens) => {
      if (err) return res.status(500).json({ error: err.message });
      // Montar resposta no formato antigo: cada pedido vira um objeto com sabor_1, sabor_2, ...
      db.all('SELECT * FROM sabores ORDER BY id', [], (err, sabores) => {
        if (err) return res.status(500).json({ error: err.message });
        const saboresIds = sabores.map(s => s.id);
        const pedidosComSabores = pedidos.map(pedido => {
          const obj = { ...pedido };
          for (const sid of saboresIds) {
            obj['sabor_' + sid] = 0;
          }
          for (const item of itens.filter(i => i.pedido_id === pedido.id)) {
            obj['sabor_' + item.sabor_id] = item.quantidade;
          }
          return obj;
        });
        res.json(pedidosComSabores);
      });
    });
  });
});

// Listar itens de um pedido específico
app.get('/api/pedidos/:id/itens', (req, res) => {
  const { id } = req.params;
  db.all(`SELECT ip.sabor_id, ip.quantidade, ip.valor_unitario, 
          (ip.quantidade * ip.valor_unitario) as valor_total_item,
          s.nome as sabor_nome
          FROM itens_pedido ip 
          JOIN sabores s ON ip.sabor_id = s.id 
          WHERE ip.pedido_id = ?`, [id], (err, itens) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(itens);
  });
});

// Marcar pedido como feito e preencher pronto_UTC
app.patch('/api/pedidos/:id/feito', (req, res) => {
  const { id } = req.params;
  const { feito } = req.body;
  if (feito == 0) {
    db.run('UPDATE pedidos SET feito = 0, pronto_UTC = NULL WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  } else {
    db.run('UPDATE pedidos SET feito = 1, pronto_UTC = CURRENT_TIMESTAMP WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }
});

// Listar todos os sabores
app.get('/api/sabores', (req, res) => {
  db.all('SELECT * FROM sabores ORDER BY id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Adicionar novo sabor
app.post('/api/sabores', (req, res) => {
  const { nome, valor } = req.body;
  db.run('INSERT INTO sabores (nome, valor) VALUES (?, ?)', [nome, valor ?? 0], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Atualizar fazendo, qnt ou valor de um sabor
app.patch('/api/sabores/:id', (req, res) => {
  const { id } = req.params;
  const { fazendo, qnt, valor } = req.body;
  db.run('UPDATE sabores SET fazendo = COALESCE(?, fazendo), qnt = COALESCE(?, qnt), valor = COALESCE(?, valor) WHERE id = ?', [fazendo, qnt, valor, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Atualizar quantidade de um sabor em um pedido
app.patch('/api/pedidos/:pedidoId/sabor/:saborId', (req, res) => {
  const { pedidoId, saborId } = req.params;
  const { quantidade } = req.body;
  if (quantidade === undefined || quantidade < 0) {
    return res.status(400).json({ error: 'Quantidade inválida' });
  }
  
  // Função para recalcular valor total do pedido
  function recalcularValorTotal() {
    db.all(`SELECT ip.sabor_id, ip.quantidade, ip.valor_unitario 
            FROM itens_pedido ip 
            WHERE ip.pedido_id = ?`, [pedidoId], (err, itens) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const valorTotal = itens.reduce((total, item) => total + (item.quantidade * item.valor_unitario), 0);
      
      db.run('UPDATE pedidos SET valor_total = ? WHERE id = ?', [valorTotal, pedidoId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, valor_total: valorTotal });
      });
    });
  }
  
  if (quantidade === 0) {
    // Remove o item se quantidade for 0
    db.run('DELETE FROM itens_pedido WHERE pedido_id = ? AND sabor_id = ?', [pedidoId, saborId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      recalcularValorTotal();
    });
  } else {
    // Atualiza ou insere
    db.run('UPDATE itens_pedido SET quantidade = ? WHERE pedido_id = ? AND sabor_id = ?', [quantidade, pedidoId, saborId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        // Se não existia, insere com o valor atual do sabor
        db.get('SELECT valor FROM sabores WHERE id = ?', [saborId], (err, sabor) => {
          if (err) return res.status(500).json({ error: err.message });
          const valorUnitario = sabor?.valor || 0;
          db.run('INSERT INTO itens_pedido (pedido_id, sabor_id, quantidade, valor_unitario) VALUES (?, ?, ?, ?)', 
                 [pedidoId, saborId, quantidade, valorUnitario], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            recalcularValorTotal();
          });
        });
      } else {
        recalcularValorTotal();
      }
    });
  }
});

// Listar itens de um pedido específico
app.get('/api/pedidos/:id/itens', (req, res) => {
  const { id } = req.params;
  db.all(`SELECT ip.sabor_id, ip.quantidade, ip.valor_unitario, 
          (ip.quantidade * ip.valor_unitario) as valor_total_item,
          s.nome as sabor_nome
          FROM itens_pedido ip 
          JOIN sabores s ON ip.sabor_id = s.id 
          WHERE ip.pedido_id = ?`, [id], (err, itens) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(itens);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 