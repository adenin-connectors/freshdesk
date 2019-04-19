'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var dateRange = $.dateRange(activity, "today");
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);

    api.initialize(activity);
    const response = await api(`/search/tickets?query=
    "created_at:>'${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}'` +
      ` AND created_at:<'${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}'"`);

    if ($.isErrorResponse(activity, response)) return;

    let tickets = response.body.results;
    let freshdeskDomain = api.getDomain();

    let ticketStatus = {
      title: T(activity, 'New Freshdesk Tickets'),
      link: `https://${freshdeskDomain}/a/tickets/filters/all_tickets`,
      linkLabel: T(activity, 'All Tickets'),
    };

    let noOfTickets = tickets.length;

    if (noOfTickets > 0) {
      ticketStatus = {
        ...ticketStatus,
        description: noOfTickets > 1 ? T(activity, "You have {0} new tickets.", noOfTickets) : T(activity, "You have 1 new ticket."),
        color: 'blue',
        value: noOfTickets,
        actionable: true
      };
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: T(activity, `You have no new tickets.`),
        actionable: false
      };
    }

    activity.Response.Data = ticketStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};