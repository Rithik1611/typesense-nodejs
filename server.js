const express = require('express');
const importBooks = require('./importBooks');
const searchRoute = require('./searchRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', searchRoute);

(async () => {
  try {
    await importBooks();
    console.log('✅ Book data imported');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
