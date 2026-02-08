import express from "express"
import router from "./routes.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(router)

app.listen(3000, () => {
    console.log("Web Server App is listening on http://localhost:3000")
})

app.get('/', (req, res) => {
  res.send('Hello World! This is an Express app.');
})
