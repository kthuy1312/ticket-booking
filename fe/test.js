import axios from 'axios';

axios.get('http://localhost:8080/api/concerts')
  .then(res => console.log('CONCERTS', JSON.stringify(res.data, null, 2)))
  .catch(err => console.error('ERROR', err.message));
