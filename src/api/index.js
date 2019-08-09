import axios from 'axios';
export default
   axios.create({
      //baseURL: 'https://new-stack-node-api.azurewebsites.net/',
	  //baseURL: 'http://192.168.31.64:7000/',
	  baseURL: 'http://192.168.31.158:5002/',
      timeout: 2000,
      headers: {'Authorization': 'JWT ' + localStorage.getItem('front_access_token')}
   });