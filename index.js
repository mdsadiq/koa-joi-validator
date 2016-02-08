'use strict';

const Promise = require('bluebird');
const Joi = module.exports.Joi = module.exports.joi = require('joi');
const coBody = require('co-body');

const _validate = Promise.promisify(Joi.validate, { context: Joi });

module.exports.validate = function (opts) {
    const _opts = Object.assign({
        failure: 400
    }, opts);
    return function * (next) {
        this.request.validated = { query: {}, body: {}, headers: {}, params: {} };
        if (_opts.type && coBody[_opts.type]) {
            this.request.body = yield coBody[_opts.type](this);
        }
        try {
            if (_opts.body) {
                this.request.body = yield _validate(this.request.body, _opts.body, _opts.options);
            }
            if (_opts.headers) {
                yield _validate(this.request.headers, _opts.headers, _opts.options);
            }
            if (_opts.query) {
                yield _validate(this.request.query, _opts.query, _opts.options);
            }
            if (_opts.params) {
                yield _validate(this.request.params, _opts.params, _opts.options);
            }
        } catch (e) {
            this.throw(_opts.failure, e);
        }
        yield next;
    };
};