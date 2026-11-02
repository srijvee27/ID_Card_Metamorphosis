import app from './api/index.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Metamorphosis ID Card Generator API server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini Model: gemini-2.5-flash-image / Nano Banana`);
});
