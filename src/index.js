const connectDB = require('./config/database');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));