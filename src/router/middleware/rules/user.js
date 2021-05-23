// import store from '../../../store';
import axios from 'axios';

export default (to, from, next) => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common = {'Authorization': `Bearer ${token}`};
    
    if(token){
        next();
    }
    else{
        next({name: 'Login'});
    }
}