// import axios from 'axios';

// // export const baseURL_WS:string= 'http://localhost:8080'
// export const baseURL_WS:string= 'http://10.27.144.225:8081'


// // export const baseURL:string= 'http://localhost:8080'
// export const baseURL: string = 'http://10.27.144.225:8081';

// const axiosClient = axios.create({

//   baseURL:baseURL,
//   withCredentials: true, // you can remove this if not using cookies
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add a request interceptor to set Authorization header dynamically
// axiosClient.interceptors.request.use(config => {
//   const token = sessionStorage.getItem('token'); // get fresh token every request
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     delete config.headers.Authorization; // in case no token
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });
// export default axiosClient;


import axios from "axios";

// export const baseURL_WS: string = "http://localhost:8080";
export const baseURL_WS: string = "http://10.27.144.225:8081";

// export const baseURL: string = "http://localhost:8080";
export const baseURL: string = "http://10.27.144.225";

const axiosClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});
export default axiosClient;