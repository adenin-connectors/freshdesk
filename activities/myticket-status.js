'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api('/tickets');

    if (Activity.isErrorResponse(response)) return;

    let tickets = response.body;
    let freshdeskDomain = api.getDomain();

    let ticketStatus = {
      title: T('Freshdesk Tickets'),
      link: `https://${freshdeskDomain}/a/tickets/filters/all_tickets`,
      linkLabel: T('All Tickets'),
    };

    let noOfTickets = tickets.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: noOfTickets > 1 ? T("You have {0} tickets.", noOfTickets) : T("You have 1 ticket."),
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(`You have no tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    Activity.handleError(error);
  }
};