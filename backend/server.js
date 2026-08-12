const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection (MongoDB Atlas ko connection string rakhne)
mongoose.connect('YOUR_MONGODB_CONNECTION_STRING', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Database Connected Successfully!'))
  .catch(err => console.log(err));

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});