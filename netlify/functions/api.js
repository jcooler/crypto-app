/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const axios = require('axios');

exports.handler = async (event, context) => {
  const API_KEY = process.env.VITE_API_KEY;
  const response = await axios.get(`https://your-api.com/data?api_key=${API_KEY}`);
  return {
    statusCode: 200,
    body: JSON.stringify(response.data)
  };
};