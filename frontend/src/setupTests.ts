import '@testing-library/jest-dom';
import axios from 'axios';

// Fail tests if any unmocked fetch is called
const originalFetch = global.fetch;
beforeAll(() => {
  global.fetch = (...args) => {
    throw new Error(
      `Unexpected fetch call in test: ${args[0]}. You must mock all API requests.`
    );
  };
});
afterAll(() => {
  global.fetch = originalFetch;
});

// Fail tests if any unmocked axios request is made
const originalAxios = axios.request;
beforeAll(() => {
  axios.request = function (...args) {
    throw new Error(
      `Unexpected axios request in test: ${JSON.stringify(args[0])}. You must mock all API requests.`
    );
  };
});
afterAll(() => {
  axios.request = originalAxios;
});
