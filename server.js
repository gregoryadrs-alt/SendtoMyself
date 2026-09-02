const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8 // Batas payload buffer 100MB
});

// Buat folder uploads otomatis jika belum ada
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer untuk simpan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // Max 100 MB per file
});

app.use(express.static('public'));

// Endpoint Upload File
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file diupload' });
  }

  const room = req.body.room || '1234';
  const fileData = {
    originalName: req.file.originalname,
    fileName: req.file.filename,
    size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
    type: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  // Broadcast file baru ke semua device di room yang sama
  io.to(room).emit('new-file', fileData);
  res.json({ success: true, file: fileData });
});

// Simpan teks & file history per room di RAM
const roomData = {};

io.on('connection', (socket) => {
  socket.on('join-room', (room) => {
    socket.join(room);
    if (!roomData[room]) {
      roomData[room] = { text: '', files: [] };
    }
    // Kirim data riwayat saat device baru masuk
    socket.emit('update-text', roomData[room].text);
    socket.emit('init-files', roomData[room].files);
  });

  socket.on('send-text', ({ room, text }) => {
    if (roomData[room]) roomData[room].text = text;
    socket.to(room).emit('update-text', text);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server aktif di http://localhost:${PORT}`);
});