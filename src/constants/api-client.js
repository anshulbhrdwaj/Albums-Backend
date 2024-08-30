const axios = require("axios");

const apiClient = axios.create({
  baseURL: "https://58b3-103-175-8-35.ngrok-free.app",
});

const publicEarn = axios.create({
  baseURL: `https://publicearn.com`
})

module.exports = {apiClient, publicEarn};
