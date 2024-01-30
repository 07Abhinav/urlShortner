const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.use(express.json());

app.use("/url", urlRoute);

app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    
    try {
      const entry = await URL.findOneAndUpdate(
        { shortId },
        {
          $push: {
            visitHistory: {
              timestamp: Date.now(),
            },
          },
        }
      );
  
      if (!entry) {
        // Entry with the provided shortId not found
        return res.status(404).send('Entry not found');
      }
  
      // Redirect to the stored URL
      res.redirect(entry.redirectURL);
    } catch (error) {
      // Handle any errors that occurred during the database query
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
});  

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
