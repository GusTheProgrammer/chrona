// code from https://k6.io/docs/test-types/spike-testing/ changed intervals though.
import http from 'k6/http';
import {sleep} from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 2000 },
    { duration: '30s', target: 0 },
  ],
};

export default () => {
  const urlRes = http.get('https://chrona.me/');
  sleep(1);
};
