const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');
const box = document.getElementById('box')

async function fetchImage(){
    const data = await fetch(URL_API);
    const reader = data.body
    
    const blob = await data.blob()
    const url = URL.createObjectURL(blob);
    buildImage(url);
    //const imgElement = document.createElement('img');
    /*
    imgElement.src = url;
    imageContainer.appendChild(imgElement);*/
    /*reader.pipeThrough(
        new TransformStream(new GetColorsImage())
    ).pipeTo(
        new WritableStream({
            write(chunk,controller){
                buildImage
            }
        })
    )*/

}

const buildImage = (blobUrl) => {
    const canvas = document.getElementById("canvas");
    const image = new Image();

    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image,0, 0)
    }

    image.src = blobUrl

}

(async()=>{
    await fetchImage()
})()