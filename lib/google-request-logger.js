/*
 * google-request-logger
 *
 * https://github.com/nvite/winston-google-request-logger
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */

 var url = require('url')
 , events = require('events')
 , colors = require('colors')
 , useragent = require('useragent')
 , Logger = {};

/**
 * Google logger which integrates with express to capture information about the http request.
 *
 * @param logger - Winston logger instance.
 * @param format (optional) - Object containing format options (see below).
 * @return {Function}
 */
 Logger.create = function (logger, options) {

  return function (req, res, next) {
    var latency = {},
    requestEnd = res.end,
    requestedUrl = url.parse(req.originalUrl),
    severity = options.level || 200
    start = process.hrtime();

    // Proxy the real end function
    res.end = function (chunk, encoding) {

      // ns response time
      var end = process.hrtime();
      latency.seconds = end[0] - start[0];
      latency.nanos = end[1] - start[1];
      if (latency.seconds > 0 && latency.nanos < 0) {
        latency.seconds -= 1;
        latency.nanos += 1000000000;
      }

      // Our format argument above contains key-value pairs for the output
      // object we send to Winston. Let's use this to format our results:
      var httpRequest = {
        latency,
        remoteIp: req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress,
        requestMethod: req.method,
        referer: req.referer,
        requestSize: req && req.socket && req.socket.bytesread || 0,
        responseSize: req && req.socket && req.socket.bytesWritten || 0,
        status: res.statusCode,
        requestUrl: requestedUrl.path,
        userAgent: useragent.parse(req.headers['user-agent']).toString()
      };

      // Do the work expected
      res.end = requestEnd;
      res.end(chunk, encoding);

      // log request
      var entry = logger.entry({ severity, httpRequest }, {});
      return logger.write(entry);
    };

    next();
  };
};

module.exports = Logger;
