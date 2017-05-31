'use strict';

const r = require('rethinkdb');

function visit(reql, fn) {
  const queue = [ reql ];
  while (queue.length > 0) {
    const [ op, args, _opts ] = queue.pop();
    if (fn(op, args) === false) { return false; }
    args.forEach((term) => Array.isArray(term) && queue.push(term));
  }
  return true;
}

const RDBVal = Object.getPrototypeOf(r.expr(1));
module.exports = function rereql(reql, blacklist) {
  const isSafe = visit(reql, (term) => blacklist.indexOf(term) === -1);
  if (!isSafe) {
    throw new Error('REQL expression contains restricted terms');
  }

  return Object.create(RDBVal, {
    build: {
      value: function() { return reql; },
      writable: false,
    },
    compose: {
      value: function() { return 'reql(' + JSON.stringify(reql) + ')'; },
      writable: false,
    },
  });
};
