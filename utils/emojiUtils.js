const mockingVideos = [
  "https://example.com/funny1.mp4",
  "https://example.com/fail-cat.gif",
  "https://example.com/rickroll.mp4",
  "https://example.com/try-again-baby.mp4"
];

function getRandomMockingVideo() {
  return mockingVideos[Math.floor(Math.random() * mockingVideos.length)];
}

module.exports = { getRandomMockingVideo };
