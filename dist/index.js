"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settle_1 = __importDefault(require("axios/lib/core/settle"));
const buildURL_1 = __importDefault(require("axios/lib/helpers/buildURL"));
const buildFullPath_1 = __importDefault(require("axios/lib/core/buildFullPath"));
const http_status_codes_1 = require("http-status-codes");
function axiosCordovaAdapter(config) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            let data;
            let url = (0, buildURL_1.default)((0, buildFullPath_1.default)(config.baseURL, config.url), config.params, config.paramsSerializer);
            let serializer = '';
            let headers = Object.assign(config.auth ? cordova.plugin.http.getBasicAuthHeader(config.auth.username, config.auth.password) : {}, config.headers);
            if (config.data instanceof URLSearchParams) {
                serializer = 'utf8';
                headers['content-type'] = 'application/x-www-form-urlencoded';
                data = config.data.toString();
            }
            else if (config.data instanceof Uint8Array || config.data instanceof ArrayBuffer) {
                serializer = 'raw';
                data = config.data;
            }
            else if (config.data instanceof FormData) {
                serializer = 'multipart';
                data = config.data;
            }
            else if (config.data && typeof config.data === 'object') {
                serializer = 'json';
                data = config.data;
            }
            else {
                serializer = 'utf8';
                data = config.data ? String(config.data) : '';
            }
            let responseType = '';
            switch (config.responseType) {
                case 'text':
                case 'json':
                case 'arraybuffer':
                case 'blob':
                    responseType = config.responseType;
                    break;
                default:
                    responseType = 'text';
                    break;
            }
            let options = {
                method: config.method.toLowerCase(),
                responseType,
                followRedirect: typeof config.maxRedirects !== 'number' || config.maxRedirects > 0
            };
            switch (options.method) {
                case 'post':
                case 'put':
                case 'patch':
                    options.data = data;
                    options.serializer = serializer;
                    break;
                case 'get':
                case 'head':
                case 'delete':
                case 'options':
                case 'upload':
                case 'download':
                    break;
                default:
                    options.method = 'get';
            }
            if (config.timeout) {
                if (typeof config.timeout === 'number') {
                    options.timeout = Math.max(0, config.timeout / 1000);
                }
                else {
                    options.timeout = Math.max(0, parseFloat(String(config.timeout)) || 0) / 1000;
                }
            }
            if (Object.keys(headers).length > 0)
                options.headers = headers;
            let response = yield new Promise(resolve => cordova.plugin.http.sendRequest(url, options, (response) => resolve(response), (response) => resolve(response)));
            switch (config.responseType) {
                case 'document':
                    try {
                        response.data = new DOMParser().parseFromString(response.data, response.data.startsWith('<?xml') ? 'text/xml' : 'text/html');
                    }
                    catch (error) {
                        console.log(error);
                    }
                    break;
                case 'stream':
                    response.data = new ReadableStream(new (class {
                        constructor(text) {
                            this.text = text;
                        }
                        start(controller) {
                            controller.enqueue(this.text);
                            controller.close();
                        }
                        ;
                    })(response.data));
                    break;
            }
            response.config = config;
            response.statusText = (0, http_status_codes_1.getReasonPhrase)(response.status);
            (Object.prototype.toString.call(config.settle) === '[object Function]'
                ? config.settle
                : settle_1.default)(resolve, reject, response);
        }
        catch (error) {
            reject(error);
        }
    }));
}
exports.default = axiosCordovaAdapter;
;
