const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const { Deta } = require('deta');
const cors = require("cors"); // Import the cors package
const {imgbbUpload} = require('imgbb-image-uploader');


app.use(express.json());

const deta = Deta("d0bj3PG7ayJ_Ghs7UxMSxkS7hiJoueRwiqNVfLYVbJZw");
const db = deta.Base('animash');
// Enable CORS for all URLs
app.use(cors({ origin: '*' }));
app.options('*', cors()); // This responds to preflight requests
app.use(express.urlencoded({ extended: true }))
const apiKey = '17b9bfd8675ad27a42236df154e72f9a'; // You should replace this with your actual ImgBB API key.





// APIS
app.get("/", (req, res) => {
  res.send("Hello from Space! 🚀");
});



// Add New Anime API
app.post("/addNewAnime", async (req, res) => {
  try {
    const { image } = req.body;

    const generateUniqueName = () => {
      const uuid = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      const uniqueName = `${uuid()}${uuid()}${uuid()}${uuid()}`;
      return uniqueName;
    }

    const data = await imgbbUpload({
      key: apiKey,        
      image: image,       
      expiration: 600000, 
      name: generateUniqueName(), 
    });
    const imageUrl = data?.data?.url;

    console.log("Image uploaded to ImgBB:", imageUrl);
    const payload = {
      imageUrl:imageUrl,
      name:req.body.name,
      score:"0",
      serial:req.body.serial,
      desc:req.body.desc,
       };
    const response = await db.put(payload);

    // Respond with success
    res.status(200).json({ message: 'Data Added Successfully' });

  } catch (error) {
    console.error('Error uploading the image:', error);

    // Respond with an error
    res.status(500).json({ error: 'An error occurred while uploading the image' });
  }
});


// Get Anime API
app.post("/getAnime", async (req, res) => {
  const serial = req.body.serial;
  console.log(serial);
  try {
    const response = await db.fetch({serial:serial.toString()});
    console.log(response);
    res.status(200).json({ message: 'Data fetched successfully', data: response });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

// Add New Score API
app.post("/addNewScore", async (req, res) => {
  try {
    const key = req.body.key;
    const serial = req.body.serial;

    // Fetch the current score
    const getScore = await db.fetch({ serial: serial.toString() });
    const currentScore = getScore?.items[0]?.score;

    if (currentScore !== undefined) {
      // Calculate the new score
      const newScore = parseInt(currentScore) + 1;

      // Update the score in the database
      const response = await db.update({ score: newScore.toString() },key);
      console.log(response);

      res.status(200).json({ message: 'Score Updated Successfully' });
    } else {
      res.status(404).json({ error: 'Score not found' });
    }
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ error: 'An error occurred while updating the score' });
  }
});





// Get Top 5 Score Anime
// Get Top 5 Score Anime
app.get("/getAllData", async (req, res) => {
  try {
    // Fetch data and convert scores to numbers, then sort and limit to the top 5 results
    const response = await db.fetch({}); // Fetch all the data
    console.log(response);
    res.status(200).json({ message: 'Top 5 anime fetched successfully', data: response });
  } catch (error) {
    console.error("Error fetching top 5 anime:", error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});







// Listen on port 8080
app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
