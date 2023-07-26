import http, { createServer } from 'http';
import { createReadStream } from 'fs';

const imagePath = '../image/spyder.png';
const imageStream = createReadStream(imagePath);

function handler(request,response){

    const headers = {'Content-Type':'image/png','Access-Control-Allow-Origin':'*'}
    response.writeHead(200,headers);
    imageStream.pipe(response);
}

const server = createServer(handler);
server.listen(8080)
server.on('listening',()=>console.log("Server is running at 8080"));