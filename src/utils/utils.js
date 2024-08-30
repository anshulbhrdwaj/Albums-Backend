function getFileExtension(url) {
  return url?.split(".").pop().split(/\#|\?/)[0];
}

const videoExtensions = ["mp4", "webm", "ogg", "mov", "flv", "avi", "mkv"];

function isVideoUrl(url) {
  const extension = getFileExtension(url);
  return videoExtensions.includes(extension?.toLowerCase());
}

module.exports = { isVideoUrl }
