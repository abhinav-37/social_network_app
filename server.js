const express = require("express");
const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const app = express();

//database connection
connectDB();

app.get("/", (req, res) => {
    res.send("api running");
});
//user middleware
app.use(express.json({ extended: false }));

//defin routes
app.use("/api/auth", require("./routes/apis/auth"));
app.use("/api/posts", require("./routes/apis/posts"));
app.use("/api/profile", require("./routes/apis/profile"));
app.use("/api/users", require("./routes/apis/users"));

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
