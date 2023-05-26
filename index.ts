import axios from "axios";

//////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getCookie(
  prefix: string,
  user: string,
  pass: string
): Promise<any> {
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
    let cookies:any = response.headers['set-cookie'];
    let sessionIdCookie = cookies.find((cookie:any) => cookie.includes('ASP.NET_SessionId='));
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
  private account: any;

  constructor(private prefix: string, private sessionId: string) {
    this.prefix = prefix
    this.sessionId = sessionId
  }

  async makeRequest(
    uri: string,
    method: string,
    data: any
  ): Promise<any> {
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

  async getAccount(): Promise<any> {
    let r = await this.makeRequest('/Services/Accounts.svc/GetAccount', 'POST', null);
    this.account = r
    return(r)
  }

  async getPersonalDetails(): Promise<any> {
    let r = await this.makeRequest('/services/mobile.svc/GetMobilePersonalDetails', 'POST', {
      'userId': this.account['userId'],
    });
    return(r)
  }

  async getTimetable(): Promise<any> {
    const formattedDate = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric'})+' - 12:00 am';
    let r = await this.makeRequest('/Services/mobile.svc/GetScheduleLinesForDate', 'POST', {
      'userId': this.account['userId'],
      'date': formattedDate
    });
    return(r)
  }

  async getLessonById(instanceId:string): Promise<any> {
    let r = await this.makeRequest('/services/mobile.svc/GetInstanceById', 'POST', {
      'userId': this.account['userId'],
      'instanceId': instanceId
    });
    return(r)
  }

  async getStaff(): Promise<any> {
    let r = await this.makeRequest('/Services/User.svc/GetAllStaff', 'POST', {
      'userId': this.account['userId'],
    });
    return(r)
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

export { getCookie, Session };