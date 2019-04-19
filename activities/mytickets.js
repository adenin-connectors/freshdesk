'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var pagination = $.pagination(activity);
    api.initialize(activity);
    const response = await api(`/tickets?page=${pagination.page}&per_page=${pagination.pageSize}`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = convertResponse(response);
  } catch (error) {
    $.handleError(activity, error);
  }
};
/**maps response data to items */
function convertResponse(response) {
  let items = [];
  let tickets = response.body;

  let freshdeskDomain = api.getDomain();

  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = {
      id: raw.id,
      title: raw.subject,
      description: raw.type,
      link: `https://${freshdeskDomain}/a/tickets/${raw.id}`,
      raw: raw
    };
    items.push(item);
  }

  return { items: items };
}