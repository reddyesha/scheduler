import React from 'react';
import ReactDOM from 'react-dom';

import { fetchData } from './api';
import App from './App';

const testData = {
  data: {
    data: [
      {
        id:'0',
        type:'task',
        attributes: {
          cron:'0 7 14 3 *',
          name:'Repot Sunny the Succulent',
        },
      },
      {
        id:'1',
        type:'task',
        attributes: {
          cron:'0 18 20 * *',
          name:'Pick up Grove order from mailroom',
        },
      },
    ],
  }
}

describe ('Scheduler tests', () => {
  beforeEach(() => {
    fetchData().then = jest.fn().mockReturnValue(testData);
  });

  describe('Data fetching', () => {
    it('renders without crashing', () => {
      const div = document.createElement('div');
      ReactDOM.render(<App />, div);
      ReactDOM.unmountComponentAtNode(div);
    });

    it('fetches event data');
  });

  describe('Component rendering', () => {
    it('displays four sections outlining past and upcoming events');
    it('displays events happening in the next 24 hours under the appropriate section');
    it('displays events that have happened in the previous 3 hours under the appropriate section');
    it('displays all upcoming events under the appropriate section');
    it('displays all past events under the appropriate section');
    it('displays a notification for events that are about to start');
  });

  describe('Helper functions', () => {
    it('correctly parses the cron data to get previous and next occurrences of the event');
    it('splits data into three arrays: upcoming (24), past (3), all past and upcoming');
  });

});
