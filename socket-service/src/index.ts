console.log("hello from socket service");
import app from './app';

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`socket Service running on port ${PORT}`);
});
