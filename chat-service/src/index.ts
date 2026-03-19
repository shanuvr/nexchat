console.log("hello from chat service");
import app from './app';

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`chat Service running on port ${PORT}`);
});
