'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    var dateRange = cfActivity.dateRange(activity, "today");
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);

    const response = await api(`/search/tickets?query=
    "created_at:>'${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}'`+
    ` AND created_at:<'${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}'"`);

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