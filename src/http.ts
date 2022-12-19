import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse 
} from "axios";

enum StatusCode {
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  TooManyRequests = 429,
  InternalServerError = 500,
}

const headers: Readonly<Record<string, string | boolean>> = {
  "accept": "application/json",
  "content-type": "application/json; charset=utf-8",
}

const authorize = (config: AxiosRequestConfig): AxiosRequestConfig => {
  try {
    const token = localStorage.getItem("accessToken");
    
    if (token != null && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  } catch (error: any) {
    throw new Error(error);
  }
};

export class Http {
  private instance: AxiosInstance | null = null;
  
  private get http(): AxiosInstance {
    return this.instance != null
    ? this.instance
    : this.init();
  }
  
  init() {
    const http = axios.create({
      baseURL: "http://192.168.1.100:8888",
      headers,
      withCredentials: true,
    });
    
    http.interceptors.request.use(authorize, (error) => Promise.reject(error));
    
    http.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;
        return this.handleError(response);
      }
    );
      
    this.instance = http;
     
    return http;
  }
    
  request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    return this.http.request(config);
  }
  
  get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.get<T, R>(url, config);
  }
  
  post<T = any, R = AxiosResponse<T>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
    return this.http.post<T, R>(url, data, config);
  }
  
  put<T = any, R = AxiosResponse<T>>(url: string, data?: T, config?: AxiosRequestConfig): Promise<R> {
    return this.http.put<T, R>(url, data, config);
  }
    
  delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.delete<T, R>(url, config);
  }

  private handleError(error: Response) {
    const { status } = error;
    
    switch (status) {
      case StatusCode.InternalServerError: {
        // Handle InternalServerError
        break;
      }
      case StatusCode.Forbidden: {
        // Handle Forbidden
        break;
      }
      case StatusCode.Unauthorized: {
        // Handle Unauthorized
        break;
      }
      case StatusCode.TooManyRequests: {
        // Handle TooManyRequests
        break;
      }
    }
    
    return Promise.reject(error);
  }
}

export const http = new Http();