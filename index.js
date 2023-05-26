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
exports.Session = exports.getCookie = void 0;
const axios_1 = __importDefault(require("axios"));
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function getCookie(prefix, user, pass) {
    return __awaiter(this, void 0, void 0, function* () {
        let options = {
            method: 'POST',
            url: `https://${prefix}.compass.education/services/admin.svc/AuthenticateUserCredentials`,
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json'
            },
            data: {
                'username': user,
                'password': pass
            }
        };
        try {
            const response = yield axios_1.default.request(options);
            let cookies = response.headers['set-cookie'];
            let sessionIdCookie = cookies.find((cookie) => cookie.includes('ASP.NET_SessionId='));
            if (sessionIdCookie) {
                const sessionId = sessionIdCookie.split(';')[0].split('=')[1];
                return sessionId;
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.getCookie = getCookie;
//////////////////////////////////////////////////////////////////////////////////////////////////////////
class Session {
    constructor(prefix, sessionId) {
        this.prefix = prefix;
        this.sessionId = sessionId;
        this.prefix = prefix;
        this.sessionId = sessionId;
    }
    makeRequest(uri, method, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                method: method,
                url: `https://${this.prefix}.compass.education${uri}`,
                headers: {
                    cookie: `ASP.NET_SessionId=${this.sessionId}`,
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                },
                data: data
            };
            try {
                const response = yield axios_1.default.request(options);
                return response.data['d'];
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    getAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.makeRequest('/Services/Accounts.svc/GetAccount', 'POST', null);
            this.account = r;
            return (r);
        });
    }
    getPersonalDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.makeRequest('/services/mobile.svc/GetMobilePersonalDetails', 'POST', {
                'userId': this.account['userId'],
            });
            return (r);
        });
    }
    getTimetable() {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedDate = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' - 12:00 am';
            let r = yield this.makeRequest('/Services/mobile.svc/GetScheduleLinesForDate', 'POST', {
                'userId': this.account['userId'],
                'date': formattedDate
            });
            return (r);
        });
    }
    getLessonById(instanceId) {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.makeRequest('/services/mobile.svc/GetInstanceById', 'POST', {
                'userId': this.account['userId'],
                'instanceId': instanceId
            });
            return (r);
        });
    }
    getStaff() {
        return __awaiter(this, void 0, void 0, function* () {
            let r = yield this.makeRequest('/Services/User.svc/GetAllStaff', 'POST', {
                'userId': this.account['userId'],
            });
            return (r);
        });
    }
}
exports.Session = Session;
