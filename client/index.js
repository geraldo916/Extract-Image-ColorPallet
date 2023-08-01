const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');
const box = document.getElementById('box')

async function fetchImage(){
    const data = await fetch(URL_API);
    const reader = data.body
    /*const blob = await data.blob()
    const url = URL.createObjectURL(blob);
    const imgElement = document.createElement('img');
    imgElement.src = url;
    imageContainer.appendChild(imgElement);*/
    reader.pipeThrough(
        new TransformStream(new GetColorsImage())
    ).pipeTo(
        new WritableStream({
            write(chunk,controller){
                console.log('chunk')
            }
        })
    )

}

(async()=>{
    await fetchImage()
})()