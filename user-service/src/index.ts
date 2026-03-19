console.log("hello from user se rvice");
import app from './app';

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`user Service running on port ${PORT}`);
});
