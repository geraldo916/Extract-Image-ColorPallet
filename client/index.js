const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');
const imgElement = document.getElementById('streamed-image');

async function fetchImage(){
    const data = await fetch(URL_API);
    const reader = data.body
    const blob = await data.blob()
    const url = URL.createObjectURL(blob);
    imgElement.src = url;

    console.log(url)
    /*reader.pipeTo(
        new WritableStream({
            write(chunk,controller){
                pako.infla
            }
        })
    )*/
}

(async()=>{
    await fetchImage()
})()

/*
const response = new Response();
response.blob()
const imageTemplate = `
    <img src="" alt="">
`
*/