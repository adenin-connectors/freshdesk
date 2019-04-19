'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/tickets');

    if ($.isErrorResponse(activity, response)) return;

    let tickets = response.body;
    let freshdeskDomain = api.getDomain();

    let ticketStatus = {
      title: T(activity, 'Freshdesk Tickets'),
      link: `https://${freshdeskDomain}/a/tickets/filters/all_tickets`,
      linkLabel: T(activity, 'All Tickets'),
    };

    let noOfTickets = tickets.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: noOfTickets > 1 ? T(activity, "You have {0} tickets.", noOfTickets) : T(activity, "You have 1 ticket."),
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    $.handleError(activity, error);
  }
};