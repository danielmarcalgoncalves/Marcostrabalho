import express from 'express';
import prisma from './prisma';

const app = express();
app.use(express.json());

app.post('/generos', async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ error: 'O nome do gênero é obrigatório.' });

  const genero = await prisma.genero.create({ data: { nome } });
  return res.status(201).json(genero);
});

app.post('/plataformas', async (req, res) => {
  const { nome } = req.body;
  if (!nome) return res.status(400).json({ error: 'O nome da plataforma é obrigatório.' });

  const plataforma = await prisma.plataforma.create({ data: { nome } });
  return res.status(201).json(plataforma);
});

app.post('/jogos', async (req, res) => {
  const { titulo, idGenero } = req.body;
  if (!titulo || !idGenero) return res.status(400).json({ error: 'Título e idGenero são obrigatórios.' });

  try {
    const jogo = await prisma.jogo.create({ data: { titulo, idGenero } });
    return res.status(201).json(jogo);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao cadastrar jogo. Verifique o idGenero.' });
  }
});

app.get('/generos', async (_req, res) => {
  const generos = await prisma.genero.findMany({ include: { jogos: true } });
  return res.json(generos);
});

app.get('/plataformas', async (_req, res) => {
  const plataformas = await prisma.plataforma.findMany({ include: { jogos: true } });
  return res.json(plataformas);
});

app.post('/jogos/:id/plataformas', async (req, res) => {
  const { id } = req.params;
  const { plataformaIds } = req.body;

  try {
    const jogoAtualizado = await prisma.jogo.update({
      where: { id: Number(id) },
      data: {
        plataformas: {
          set: plataformaIds.map((id: number) => ({ id }))
        }
      },
      include: { plataformas: true }
    });
    return res.json(jogoAtualizado);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao relacionar plataformas.' });
  }
});

app.get('/jogos', async (req, res) => {
  const jogos = await prisma.jogo.findMany({
    include: {
      genero: true,
      plataformas: true
    }
  });
  return res.json(jogos);
});

app.get('/', (_req, res) => {
  res.send('API REST de jogos está funcionando. Use /generos, /plataformas ou /jogos.');
});

app.listen(3000, () => {
  console.log('🚀 API rodando em http://localhost:3000');
});