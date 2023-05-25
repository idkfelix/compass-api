const axios = require("axios").default;

//////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getCookie(prefix, user, pass) {
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
    const response = await axios.request(options);
    let cookies = response.headers['set-cookie'];
    let sessionIdCookie = cookies.find(cookie => cookie.includes('ASP.NET_SessionId='));
    if (sessionIdCookie) {
      const sessionId = sessionIdCookie.split(';')[0].split('=')[1];
      return sessionId;
    }
  } catch (error) {
    console.error(error);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

class Session {
  constructor(prefix, cookie) {
    this.prefix = prefix
    this.sessionId = cookie
  }

  async makeRequest(uri, method, data) {
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
      const response = await axios.request(options);
      return response.data['d'];
    } catch (error) {
      console.error(error);
    }
  }

  async getAccount() {
    let r = await this.makeRequest('/Services/Accounts.svc/GetAccount', 'POST', null);
    this.account = r
    return(r)
  }

  async getPersonalDetails() {
    let r = await this.makeRequest('/services/mobile.svc/GetMobilePersonalDetails', 'POST', {
      'userId': this.account['userId'],
    });
    return(r)
  }

  async getTimetable() {
    const formattedDate = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'})+' - 12:00 am';
    let r = await this.makeRequest('/Services/mobile.svc/GetScheduleLinesForDate', 'POST', {
      'userId': this.account['userId'],
      'date': formattedDate
    });
    return(r)
  }

  async getLessonById(instanceId) {
    let r = await this.makeRequest('/services/mobile.svc/GetInstanceById', 'POST', {
      'userId': this.account['userId'],
      'instanceId': instanceId
    });
    return(r)
  }

  async getStaff() {
    let r = await this.makeRequest('/Services/User.svc/GetAllStaff', 'POST', {
      'userId': this.account['userId'],
    });
    return(r)
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { getCookie, Session };