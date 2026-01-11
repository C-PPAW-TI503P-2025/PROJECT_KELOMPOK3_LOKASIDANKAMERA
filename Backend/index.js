// index.js
import express from 'express'; // wajib import express

const app = express(); // sekarang bisa dipakai
const port = 3000;

app.get('/', (req, res) => {
  res.send(`Server berjalan di port ${port}`);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
