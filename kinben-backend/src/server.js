import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`KINBEN API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
