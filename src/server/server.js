import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

dotenv.config();

const app = express();

app.use(express.json());

const clientDist = path.resolve(process.cwd(), 'dist');

// Serve static files from the "dist" folder (built React app)
app.use(express.static(clientDist));

// Catch-all: send index.html for React Router to handle routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
