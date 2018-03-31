import _ from 'lodash';
import parser from 'cron-parser';
import moment from 'moment';
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { List, ListItem } from 'material-ui/List';
import { Card, CardHeader } from 'material-ui/Card';
import ActionDateRange from 'material-ui/svg-icons/action/date-range';

import { fetchData } from './api';
import { formatDate } from './utils';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      schedule: {},
      eventsInLastThreeHours: [],
      eventsInUpcoming24Hours: [],
      allOtherEvents: [],
    };

    this.getEventData = this.getEventData.bind(this);
    this.notificationCallback = this.notificationCallback.bind(this);
  }

  componentWillMount() {
    this.getEventData();
  }

  componentDidMount() {
    // poll to display event notifications
    setInterval(this.notificationCallback, 1000);
  }

  /**
   * This function checks for an event that's about to start to display a
   * notification.
   */
  notificationCallback() {
    const upcomingEvents = this.state.eventsInUpcoming24Hours;

    _.forEach(upcomingEvents, (upcomingEvent) => {
      const timeDiff = moment(new Date(upcomingEvent.occurrences.next)).diff(new Date(), 'seconds');

      if (timeDiff === 0) {
        Notification.requestPermission()
        .then((permissionStatus) => {
          if (permissionStatus === 'granted') {
            const eventNotification = new Notification(
              upcomingEvent.name,
              {
                body: `Starting now (${upcomingEvent.occurrences.next})`,
              },
            );
          }
        });
      }

    });
  }

  /**
   * This function formats schedule data returned by the scheduler API in a few ways:
   * 1) Get and format dates based on given cron string
   * 2) Split data into three buckets:
   *    a) eventsOnLastThreeHours: events that have happened in the previous 3 hours from the current time
   *    b) eventsInUpcoming24Hours: events happening in the next 24 hours
   *    c) allOtherEvents: all past and upcoming events outside of the 3 and 24 hour windows
   */
  getEventData() {
    fetchData().then(schedData => {
      const data = _.map(schedData.data, (datum) => {
        return {
          name: datum.attributes.name,
          occurrences: this.getOccurrences(datum.attributes.cron),
        };
      });
  
      let eventsInLastThreeHours = [];
      let eventsInUpcoming24Hours = [];
      let allOtherEvents = [];
  
      _.forEach(data, (datum) => {
        const prevDiff = moment(new Date(datum.occurrences.prev)).diff(new Date(), 'hours');
        const nextDiff = moment(new Date(datum.occurrences.next)).diff(new Date(), 'hours');
  
        if (prevDiff <= 3 && prevDiff >= -3) {
          eventsInLastThreeHours.push({
            name: datum.name,
            occurrences: datum.occurrences,
          });
        }
  
        if (nextDiff <= 24 && nextDiff >= -24) {
          eventsInUpcoming24Hours.push({
            name: datum.name,
            occurrences: datum.occurrences,
          });
        }
  
        else {
          allOtherEvents.push({
            name: datum.name,
            occurrences: datum.occurrences,
          });
        }
  
      });

      return this.setState({
        schedule: data,
        eventsInLastThreeHours,
        eventsInUpcoming24Hours,
        allOtherEvents,
      });
    });
  }

  /**
   * Gets previous and next occurences based on cron string passed in
   * Returns an object with formatted dates.
   *
   * @param {string} cronDate
   */
  getOccurrences(cronDate) {
    const options = {
      currentDate: new Date(),
    };

    const date = parser.parseExpression(cronDate, options);
    const nextOccurrence = date.next().toString();
    const previousOccurrence = date.prev().toString();

    return {
      prev: new Date(previousOccurrence).toString(),
      next: new Date(nextOccurrence).toString(),
    };
  }

  /**
   * Returns an event card with data ordered by timestamp
   *
   * @param {Object} eventData
   * @param {string} interval
   * @param {string} header
   * @param {string} subtitle
   */
  getEventCard(eventData, interval, header, subtitle) {

    const orderedEventData = eventData.sort((a, b) => {
      const dateA = new Date(a.occurrences[interval]);
      const dateB = new Date(b.occurrences[interval]);
      return dateA - dateB;
    });

    return (
      <Card className='EventCard'>
        <CardHeader
          title={header}
          subtitle={subtitle}
          className='EventCardHeader'
        />
        <List>
          {
            _.map(orderedEventData, (event) => {
              return (
                <div key={`${event.name}, ${event.occurrences[interval]}`}>
                  <ListItem 
                    className='ListItem'
                    primaryText={formatDate(event.occurrences[interval])}
                    secondaryText={event.name}
                  >
                  </ListItem>
                </div>
              );
            })
          }
        </List>
      </Card>
    );
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <ActionDateRange
              color='white'
              style={{
                width: '100px',
                height: '100px',
              }}
            />
            <h1 className="App-title">Grove Scheduler Challenge</h1>
          </header>
          <div className='CardLayout'>
            { this.getEventCard(this.state.eventsInUpcoming24Hours, 'next', 'Coming up', 'next 24 hours') }
            { this.getEventCard(this.state.eventsInLastThreeHours, 'prev', 'Just passed', 'last three hours') }
            { this.getEventCard(this.state.allOtherEvents, 'next', 'Other upcoming events', 'All upcoming events beyond 24 hours from now') }
            { this.getEventCard(this.state.allOtherEvents, 'prev', 'Other Past events', 'All past events beyond three hours ago from now') }
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;