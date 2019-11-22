'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    let currentUser = await api('/agents/me');
    if ($.isErrorResponse(activity, currentUser)) return;
    let currentUserId = currentUser.body.id;

    var dateRange = $.dateRange(activity);
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);
    let pagination = $.pagination(activity); //default page size is 30, I can't get it to work as param in request url

    // status:2 == open tickets
    let response = await api(`/search/tickets?query=
    "(created_at:>'${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}'` +
      ` AND created_at:<'${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}')` +
      ` AND agent_id:${currentUserId} AND status:2"&page=${pagination.page}`);
    if ($.isErrorResponse(activity, response)) return;

    let value = response.body.total;

    let freshdeskDomain = api.getDomain();
    activity.Response.Data.items = api.convertResponse(response.body.results);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, "Open Tickets");
      activity.Response.Data.link = `https://${freshdeskDomain}/a/tickets/filters/all_tickets`;
      activity.Response.Data.linkLabel = T(activity, 'All Tickets');
      activity.Response.Data.actionable = value > 0;
      activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/freshdesk.svg';

      if (value > 0) {
        activity.Response.Data.value = value;
        // items are alrady sorted by date descending (higest value first) in api request
        // request wasn't changed it's just tested to see how it is sorted
        // sort_by and sort_type can't be added to /search/tickets enpoint
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tickets assigned.", value) :
          T(activity, "You have 1 ticket assigned.");
        activity.Response.Data.briefing = activity.Response.Data.description + ' The latest is <b>' + activity.Response.Data.items[0].title + '</b>';
      } else {
        activity.Response.Data.description = T(activity, `You have no tickets assigned.`);
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};