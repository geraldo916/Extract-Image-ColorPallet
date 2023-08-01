const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');
const box = document.getElementById('box')

async function fetchImage(){
    const data = await fetch(URL_API);
    const blob = await data.blob()
    const url = URL.createObjectURL(blob);
    buildImage(url);
}

const buildImage = (blobUrl) => {
    const canvas = document.getElementById("canvas");
    const image = new Image();
    image.onload = () => {
        canvas.width = 20;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image,0, 0)

        const imageData = context.getImageData(0,0, 20, image.height);
        const rgbaColors = extractImageColors(imageData.data);
        
        const quatizationColors = medianCutQuantization(rgbaColors, 0);
        console.log(quatizationColors)

    }
    image.src = blobUrl
}

/**
 * 
 * @param {Uint8ClampedArray} imageData 
 */

const extractImageColors = (imageData) => {
    const colors = []

    for(let i = 0; i< imageData.length; i += 4){
        const alphaChannel = imageData[i + 3] / 255;
        const rgbaColors = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
            a: alphaChannel.toString().length > 1? parseFloat(alphaChannel.toFixed(2)) : alphaChannel
        }
        colors.push(rgbaColors)
    }
    return colors
}

/**
 * 
 * @param {Array} rgbaColors 
 * @param {number} depth 
 */

const medianCutQuantization = (rgbaColors, depth) => {
    const COLOR_DEPHT = 4;

    // Base case
    if(depth === COLOR_DEPHT || rgbaColors === 0){
        const color = rgbaColors.reduce((prev, curr)=>{
            prev.r += curr.r
            prev.g += curr.g
            prev.b += curr.b
            prev.a += curr.a

            return prev;
        },{r:0,g:0,b:0,a:0})
        color.r = Math.round(color.r / rgbaColors.length);
        color.g = Math.round(color.g / rgbaColors.length);
        color.b = Math.round(color.b / rgbaColors.length);
        color.a = Math.round(color.a / rgbaColors.length);

        return [color]
    }

    const biggestChannelRange = getBiggestChannelRange(rgbaColors);
    rgbaColors.sort((p1,p2) => p1[biggestChannelRange] - p2[biggestChannelRange]);

    const mid = rgbaColors.length / 2;
    return [
        ...medianCutQuantization(rgbaColors.slice(0, mid), depth + 1),
        ...medianCutQuantization(rgbaColors.slice(mid + 1), depth + 1)
    ]
}

const getBiggestChannelRange = (rgbaColors) => {
    let rMin = 255;
    let gMin = 255;
    let bMin = 255;
    let aMin = 1;

    let rMax = 0;
    let gMax = 0;
    let bMax = 0;
    let aMax = 0;

    rgbaColors.forEach(color => {
        rMin = Math.min(rMin, color.r)
        gMin = Math.min(gMin, color.g)
        bMin = Math.min(bMin, color.b)
        aMin = Math.min(aMin, color.a)

        rMax = Math.max(rMax, color.r)
        gMax = Math.max(gMax, color.g)
        bMax = Math.max(bMax, color.b)
        aMax = Math.max(aMax, color.a)
    })

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;
    const aRange = aMax - aMin;

    const biggestRange = Math.max(rRange, gRange, bRange);
    if(biggestRange === rRange){
        return "r";
    }else if(biggestRange === gRange){
        return "g";
    }else if(biggestRange === bRange){
        return "b";
    }else{
        return "a"
    }
}

(async()=>{
    await fetchImage()
})()