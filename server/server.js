require('dotenv').config();
const app = require("./src/app");
const connectDB = require("./src/db/db")

const PORT = process.env.PORT || 5001;

connectDB()



app.listen(PORT , () => {
    console.log(`Server is Running on port ${PORT}`);
});