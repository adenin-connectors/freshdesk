'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    var dateRange = $.dateRange(activity, "today");
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);
    let pagination = $.pagination(activity); //default page size is 30, I can't get it to work as param in request url

    let response = await api(`/search/tickets?query=
    "(created_at:>'${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}'` +
      ` AND created_at:<'${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}')"&page=${pagination.page}`);
    if ($.isErrorResponse(activity, response)) return;

    let value = response.body.total;

    let freshdeskDomain = api.getDomain();
    activity.Response.Data.items = api.convertResponse(response.body.results);
    activity.Response.Data.title = T(activity, "All Tickets");
    activity.Response.Data.link = `https://${freshdeskDomain}/a/tickets/filters/new_and_my_open`;
    activity.Response.Data.linkLabel = T(activity, 'All Tickets');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tickets.", value) :
        T(activity, "You have 1 ticket.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tickets.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
