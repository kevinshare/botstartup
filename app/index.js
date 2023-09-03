import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cuteScraper from './scripts/bumble.js';

const app = express()
const port = 3000
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extanded: false }))

// app.post('https://us-central1-simpbot-bf277.cloudfunctions.net/ai', (req, res) => {
//     const data = req.body;
//     res.send(JSON.stringify(data));
// });

const server = app.listen(port, async () => {

    // console.log(result.data.text)
    await cuteScraper();

    console.log(`Example app listening on port ${port}`)
})