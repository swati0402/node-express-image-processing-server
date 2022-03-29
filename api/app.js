const express = require('express');
const app = express();
const path= require('path')
const pathToIndex=path.resolve(__dirname,'../client/index.html')

app.use('/*', (request, resolve) => {
    rresponse.sendFile(pathToIndex)
  })
module.exports