const express = require('express');
const cors = require('cors');
const importBooks = require('./importBooks');
const searchRoute = require('./searchRoute');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', searchRoute);

(async () => {
  try {
    await importBooks();
    console.log('Book data imported');
    app.listen(PORT, () => {
      console.log(`Backend server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

