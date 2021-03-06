'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const dateRange = $.dateRange(activity);

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    const pagination = $.pagination(activity); //default page size is 30, I can't get it to work as param in request url

    const response = await api('/search/tickets?query=' +
      `"(created_at:>'${start.getFullYear()}-${('0' + (start.getMonth() + 1)).slice(-2)}-${('0' + start.getDate()).slice(-2)}'` +
      ` AND created_at:<'${end.getFullYear()}-${('0' + (end.getMonth() + 1)).slice(-2)}-${('0' + end.getDate()).slice(-2)}')` +
      ` AND status:2"&page=${pagination.page}`);

    if ($.isErrorResponse(activity, response)) return;

    const freshdeskDomain = api.getDomain();

    const items = api.convertResponse(response.body.results);

    let count = 0;
    let readDate = (new Date(new Date().setDate(new Date().getDate() - 30))).toISOString(); // default read date 30 days in the past

    if (activity.Request.Query.readDate) readDate = activity.Request.Query.readDate;

    for (let i = 0; i < items.length; i++) {
      if (items[i].date > readDate) count++;
    }

    activity.Response.Data.items = items;

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.title = T(activity, 'New Tickets');
      activity.Response.Data.link = `https://${freshdeskDomain}/a/tickets/filters/new_and_my_open`;
      activity.Response.Data.linkLabel = T(activity, 'All Tickets');
      activity.Response.Data.actionable = count > 0;
      activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/freshdesk.svg';

      if (count > 0) {
        activity.Response.Data.value = count;
        // items are alrady sorted by date descending (higest value first) in api request
        // request wasn't changed it's just tested to see how it is sorted
        // sort_by and sort_type can't be added to /search/tickets enpoint
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.description = count > 1 ? T(activity, 'You have {0} new tickets.', count) : T(activity, 'You have 1 new ticket.');
        activity.Response.Data.briefing = activity.Response.Data.description + ' The latest is <b>' + items[0].title + '</b>';
      } else {
        activity.Response.Data.description = T(activity, 'You have no new tickets.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
