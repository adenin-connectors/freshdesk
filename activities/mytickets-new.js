'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    var dateRange = cfActivity.dateRange(activity, "today");
    let today = new Date(dateRange.startDate);

    const response = await api(`/search/tickets?query=
    "created_at:'${today.getFullYear()}-${("0" + (today.getMonth() + 1)).slice(-2)}-${("0" + today.getDate()).slice(-2)}'"`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let tickets = response.body.results;
    let freshdeskDomain = api.getDomain();

    let ticketStatus = {
      title: 'New Freshdesk Tickets',
      url: `https://${freshdeskDomain}/a/tickets/filters/all_tickets`,
      urlLabel: 'All Tickets',
    };

    let noOfTickets = tickets.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${noOfTickets > 1 ? noOfTickets + " new tickets" : noOfTickets + " new ticket"}`,
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no new tickets.`,
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};