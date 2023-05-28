import axios from 'axios';

interface Session {
  sessionId: string,
  userId: string
}

class Session {
  constructor(private prefix: string, sessionId?: any, userId?: any) {
    this.prefix = prefix
    if (sessionId) {
      this.sessionId = sessionId
    }
    if (userId) {
      this.userId = userId
    }
  }

  async auth (username: string, password: string,) {
    let options = {
      method: 'POST',
      url: `https://${this.prefix}.compass.education/services/admin.svc/AuthenticateUserCredentials`,
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json'
      },
      data: {
            'username': username,
            'password': password
          }
    };

    try {
      const response = await axios.request(options);
      this.userId = response.data['d']['roles'][0]['userId']
      let cookies:any = response.headers['set-cookie'];
      let sessionIdCookie = cookies.find((cookie:any) => cookie.includes('ASP.NET_SessionId='));
      if (sessionIdCookie) {
        const sessionId = sessionIdCookie.split(';')[0].split('=')[1];
        this.sessionId = sessionId
      }
    } catch (error) {
      console.error(error);
    }
  }

  async makeRequest(uri: string, method: string, data: any ) {
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
    return(r)
  }

  async getPersonalDetails() {
    let r = await this.makeRequest('/services/mobile.svc/GetMobilePersonalDetails', 'POST', {
      'userId': this.userId,
    });
    return(r)
  }

  async getTimetable(date:string) {
    const formattedDate = `${date} - 12:00 am`
    let r = await this.makeRequest('/Services/mobile.svc/GetScheduleLinesForDate', 'POST', {
      'userId': this.userId,
      'date': formattedDate
    });
    return(r)
  }

  async getLessonById(instanceId:string) {
    let r = await this.makeRequest('/services/mobile.svc/GetInstanceById', 'POST', {
      'userId': this.userId,
      'instanceId': instanceId
    });
    return(r)
  }

  async getStaff() {
    let r = await this.makeRequest('/Services/User.svc/GetAllStaff', 'POST', {
      'userId': this.userId,
    });
    return(r)
  }
}


export { Session };