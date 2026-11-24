import http from 'node:http';
import path from 'node:path';
import express from 'express';
import { attachSignallingServer } from './src/server/signalling';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.disable('x-powered-by');

  const signalling = attachSignallingServer(httpServer);

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      app: '39 Bharat Nagar',
      version: '1.0.0',
      activeRooms: signalling.getRoomCount(),
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.ENABLE_HMR === 'true' ? { server: httpServer } : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distDir, {
        setHeaders(res, filePath) {
          if (filePath.endsWith('service-worker.js') || filePath.endsWith('manifest.webmanifest')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.startsWith('/ws/')) {
        res.sendFile(path.join(distDir, 'index.html'));
        return;
      }
      next();
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`[39 Bharat Nagar] Server listening on http://0.0.0.0:${port} (${isProd ? 'production' : 'development'})`);
  });

  const shutdown = async () => {
    const forceTimer = setTimeout(() => process.exit(0), 3000);
    forceTimer.unref();
    await signalling.close();
    httpServer.close(() => process.exit(0));
    httpServer.closeAllConnections?.();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('[39 Bharat Nagar] Failed to start server:', err);
  process.exit(1);
});
