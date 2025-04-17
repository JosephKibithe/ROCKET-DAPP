const fs = require("fs");
const https = require("https");
const path = require("path");

const templates = [
  {
    name: "drake.jpg",
    url: "https://i.imgflip.com/30b1gx.jpg",
  },
  {
    name: "distracted.jpg",
    url: "https://i.imgflip.com/1ur9b0.jpg",
  },
  {
    name: "buttons.jpg",
    url: "https://i.imgflip.com/1g8my4.jpg",
  },
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const targetDir = path.join(__dirname, "../public/meme-templates");
    const filePath = path.join(targetDir, filename);

    // Make sure the directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        response.pipe(file);

        file.on("finish", () => {
          file.close(() => {
            console.log(`Downloaded ${filename} successfully`);
            resolve();
          });
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        console.error(`Error downloading ${filename}:`, err.message);
        reject(err);
      });

    file.on("error", (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      console.error(`Error writing ${filename}:`, err.message);
      reject(err);
    });
  });
};

async function downloadAll() {
  console.log("Downloading meme templates...");

  try {
    const promises = templates.map((template) =>
      downloadImage(template.url, template.name)
    );

    await Promise.all(promises);
    console.log("All templates downloaded successfully!");
  } catch (error) {
    console.error("Error in download process:", error);
  }
}

downloadAll();
