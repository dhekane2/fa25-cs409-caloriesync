import express from 'express';

const apiRouter = express.Router();

// Business-logic / API routes live here; authentication is applied globally
// in `server.js` so handlers can assume `req.user` is populated.
apiRouter.get('/dummydashboard', (req, res) => {
  const user = req.user;
  if (user) {
    const safeUser = { id: user.id, email: user.email };
    return res.json({ user: safeUser, message: 'Welcome to dummy dashboard' });
  }
  return res.status(401).json({ message: 'Unauthorized' });
});

export default apiRouter;
