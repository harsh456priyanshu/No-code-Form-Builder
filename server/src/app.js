const express = require('express');
const cors = require('cors');
const path = require('path')

const formController = require('./controllers/form.controller');
const authRoute = require('./routes/auth.routes');
const formRoute = require('./routes/forms.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")))



app.get("/api/forms/:id", formController.getPublicForm);

app.post("/api/forms/:formId/submit", formController.createSubmission);



app.use("/api/auth", authRoute);

app.use("/api/forms", formRoute);


app.get("*name" , (req,res) => {
    res.sendFile(path.join(__dirname , "../public/index.html"))
});



module.exports = app;