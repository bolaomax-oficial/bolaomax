import { Hono } from 'hono';
import { cors } from "hono/cors"
import lotteryRoutes from './lottery-routes';
import sorteiosRoutes from './routes/sorteios-routes';
import adminBoloesRoutes from './routes/admin-boloes-hono';
import financeiroRoutes from './routes/financeiro-hono';
import authRoutes from './routes/auth-routes';
import carrinhoRoutes from './routes/carrinho-hono';
import carteiraRoutes from './routes/carteira-hono';
import configuracoesRoutes from './routes/configuracoes-hono';

const app = new Hono()
  .basePath('api');

app.use(cors({
  origin: "*"
}))

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

// Integra rotas de autenticação
app.route('/auth', authRoutes);

// Integra rotas de loteria
app.route('/', lotteryRoutes);

// Integra rotas de calendário de sorteios
app.route('/sorteios', sorteiosRoutes);

// Integra rotas de admin bolões
app.route('/admin/boloes', adminBoloesRoutes);

// Integra rotas de financeiro
app.route('/financeiro', financeiroRoutes);

// Integra rotas de carrinho
app.route('/carrinho', carrinhoRoutes);

// Integra rotas de carteira
app.route('/carteira', carteiraRoutes);

// Integra rotas de configurações
app.route('/admin/configuracoes', configuracoesRoutes);

export default app;