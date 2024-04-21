// Code found here: https://k6.io/docs/test-types/stress-testing/
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '2m', target: 200 },
    { duration: '30s', target: 0 },
  ],
};

export default () => {
  const urlRes = http.get('https://chrona.me/');
  sleep(1);
};

