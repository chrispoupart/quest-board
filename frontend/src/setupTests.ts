import '@testing-library/jest-dom';

// Fail tests if any unmocked fetch is called
beforeAll(() => {
  const originalFetch = global.fetch;
  global.fetch = (...args) => {
    throw new Error(
      `Unexpected fetch call in test: ${args[0]}. You must mock all API requests.`
    );
  };
  // Optionally, restore fetch after all tests
  afterAll(() => {
    global.fetch = originalFetch;
  });
});

// Fail tests if any unmocked axios request is made
import axios from 'axios';
beforeAll(() => {
  const originalAxios = axios.request;
  axios.request = function (...args) {
    throw new Error(
      `Unexpected axios request in test: ${JSON.stringify(args[0])}. You must mock all API requests.`
    );
  };
  // Optionally, restore axios after all tests
  afterAll(() => {
    axios.request = originalAxios;
  });
}); 
