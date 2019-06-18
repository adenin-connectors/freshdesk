'use strict';

const got = require('got');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  const freshdeskDomain = api.getDomain();

  opts = Object.assign({
    json: true,
    endpoint: `https://${freshdeskDomain}/api/v2`,
    token: _activity.Context.connector.custom2,
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Digital Assistant Connector, https://www.adenin.com/digital-assistant'
  }, opts.headers);

  if (opts.token) opts.headers.Authorization = `Basic ${Buffer.from(opts.token + ':xxxxx').toString('base64')}`;

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) return got.stream(url, opts);

  return got(url, opts).catch((err) => {
    throw err;
  });
}
const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.initialize = (activity) => {
  _activity = activity;
};

api.stream = (url, opts) => got(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

api.getDomain = function () {
  let domain = _activity.Context.connector.custom1;

  domain = domain.replace('https://', '');
  domain = domain.replace('/', '');

  if (!domain.includes('.freshdesk.com')) domain += '.freshdesk.com';

  return domain;
};

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

/**maps response data to items */
api.convertResponse = function (tickets) {
  let items = [];

  let freshdeskDomain = api.getDomain();

  for (let i = 0; i < tickets.length; i++) {
    let raw = tickets[i];
    let item = {
      id: raw.id,
      title: raw.subject,
      description: raw.type,
      date: new Date(raw.created_at).toISOString(),
      link: `https://${freshdeskDomain}/a/tickets/${raw.id}`,
      raw: raw
    };
    items.push(item);
  }

  return items;
}
module.exports = api;