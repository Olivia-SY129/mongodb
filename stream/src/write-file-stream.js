const fs = require("fs");
const data = "Hello, world!";

// Create a writable stream
const writerStream = fs.createWriteStream("local/big-file");

const NUM_BLOCKS = 500;

/** @type {Object.<string, number>} */
const numBlocksPerCharacter = {
  a: 0,
  b: 0
};

for (let i = 0; i < NUM_BLOCKS; i += 1) {
  const blockLength = Math.floor(800 + Math.random() * 200);
  const character = i % 2 === 0 ? "a" : "b";
  writerStream.write(character.repeat(1024 * blockLength));

  numBlocksPerCharacter[character] += 1;
}

// Mark the end of file
writerStream.end();

// Handle stream events --> finish, and error
writerStream.on("finish", function () {
  console.log("Write completed.");
});

writerStream.on("error", function (err) {
  console.log(err.stack);
});

console.log(numBlocksPerCharacter);
