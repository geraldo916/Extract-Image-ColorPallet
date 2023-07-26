import http, { createServer } from 'http';
import { createReadStream } from 'fs';

const imagePath = '../image/Instagram-Icon.png';
//const imageStream = createReadStream(imagePath);

/**
 * 
 * @param {http.RequestOptions} request 
 * @param {http.ServerResponse} response 
 */
function handler(request,response){
    const imageStream = createReadStream(imagePath);
    
    imageStream.on('open', () => {
        response.setHeader('Content-Type','image/png');
        response.setHeader('Access-Control-Allow-Origin','*')
        imageStream.pipe(response);
      });
    
      imageStream.on('error', (err) => {
        response.status(500).json({ error: 'Internal Server Error' });
      });
}

const server = createServer(handler);
server.listen(8080)
server.on('listening',()=>console.log("Server is running at 8080"));