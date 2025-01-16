const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
let data = new FormData();
data.append('files', fs.createReadStream('/Users/thedamnandres/Downloads/12/1712202401176815426000120010120569937840832658711.xml'));
data.append('files', fs.createReadStream('/Users/thedamnandres/Downloads/12/1712202401170408664200120011000000010608881661715.xml'));
data.append('files', fs.createReadStream('/Users/thedamnandres/Downloads/12/1712202401171300803300120010020000010366668477618.xml'));

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://127.0.0.1:8000/analizarComprobantes/',
  headers: { 
    'accept': 'application/json', 
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
