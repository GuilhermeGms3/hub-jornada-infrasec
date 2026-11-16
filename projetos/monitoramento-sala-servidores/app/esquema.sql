-- Esquema do banco "loja". Idempotente: pode rodar de novo sem estragar nada.
CREATE TABLE IF NOT EXISTS produtos (
    id       serial PRIMARY KEY,
    nome     text           NOT NULL UNIQUE,
    preco    numeric(10, 2) NOT NULL,
    estoque  integer        NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pedidos (
    id          bigserial PRIMARY KEY,
    produto_id  integer     NOT NULL REFERENCES produtos (id),
    quantidade  integer     NOT NULL,
    criado_em   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pedidos_criado_em ON pedidos (criado_em);

INSERT INTO produtos (nome, preco, estoque) VALUES
    ('Cabo de rede Cat6', 19.90, 500),
    ('Switch 8 portas',   189.00, 500),
    ('Nobreak 1200VA',    899.00, 500),
    ('SSD 480 GB',        239.90, 500),
    ('Memória 16 GB',     329.00, 500)
ON CONFLICT (nome) DO NOTHING;
