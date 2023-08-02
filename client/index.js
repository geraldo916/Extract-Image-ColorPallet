const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');
const box = document.getElementById('box')
const boxTwo = document.getElementById('boxTwo')
const AMBIENT_SIZE = 40

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
        canvas.width = image.width;
        canvas.height = image.height;
        console.log(image.height)
        const context = canvas.getContext("2d");
        context.drawImage(image,0, 0)

        const imageData = context.getImageData(0,0, image.width, image.height);

        const rgbaColors = extractImageColors(imageData.data);

        const imageMatrix = transformImageInto2dMatrix(rgbaColors,canvas.width)
    
        const leftPixels = getLeftPixels(imageMatrix,AMBIENT_SIZE)

        const rightPixels = getRightPixels(imageMatrix,AMBIENT_SIZE)

        const quatizationColorsRight = medianCutQuantization(rightPixels, 0);
        const quatizationColorsLeft = medianCutQuantization(leftPixels, 0);

        createAmbienteMode(quatizationColorsLeft,box,"to left");
        createAmbienteMode(quatizationColorsRight,boxTwo,"to right")
        
        

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
    const COLOR_DEPHT = 8;

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
    //rgbaColors.sort((p1,p2) => p1[biggestChannelRange] - p2[biggestChannelRange]);

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

const transformImageInto2dMatrix = (colorArray,imageWidth) => {

    const imageMatrixLength = Math.round(colorArray.length / imageWidth);
    let imageMatrix = new Array(imageMatrixLength);

    for(let i = 0; i < imageMatrixLength; i++){
        imageMatrix[i] = colorArray.slice((i*imageWidth), (i+1)*imageWidth)
    }

    return imageMatrix
}

const getLeftPixels = (imageMatrix, numPixels) => {
    const pixels = [];
    for(let i = 0; i < imageMatrix.length; i++){
        for(let j = 0; j < numPixels; j++){
            pixels.push(imageMatrix[i][j])
        }
    }
    return pixels;
}

const getRightPixels = (imageMatrix, numPixels) => {
    const pixels = [];
    for(let i = 0; i < imageMatrix.length; i++){
        for(let j = 0; j < imageMatrix[i].length; j++){
            
            if(j > imageMatrix[i].length - numPixels){
                pixels.push(imageMatrix[i][j])
            }
        }
    }
    return pixels;
}
/*
const getBottomtPixels = (imageMatrix, numPixels) => {
    const pixels = [];
    for(let i = 0; i < imageMatrix.length; i++){
        for(let j = 0; j < numPixels; j++){
            pixels.push(imageMatrix[i][j])
        }
    }
    return pixels;
}

const getUpPixels = (imageMatrix, numPixels) => {
    const pixels = [];
    for(let i = 0; i < imageMatrix.length; i++){
        for(let j = 0; j < imageMatrix[i].length; j++){
            
            if(j > imageMatrix[i].length - numPixels){
                pixels.push(imageMatrix[i][j])
            }
        }
    }
    return pixels;
}
*/
/**
 * 
 * @param {Array} colors 
 * @param {HTMLElement} mainElement 
 */

const createAmbienteMode = (colors, mainElement,direction) => {
    const directionGradient = direction;
    colors.forEach(color=>{
        const div = document.createElement("div");
        const color1 = `rgba(${color.r},${color.g},${color.b},1)`;

        const lightenFactor = 100;
        const r = Math.min(255, color.r + lightenFactor);
        const g = Math.min(255, color.g + lightenFactor);
        const b = Math.min(255, color.b + lightenFactor);

        const color2 = `rgba(${r}, ${g}, ${b},0.06486344537815125)`;
        const gradientBacckground = `linear-gradient(${directionGradient}, ${color1} 0%, ${color2} 100%)`
        div.style.width = `180px`;
        div.style.height = "2.2px";
        div.style.background = gradientBacckground;
        mainElement.appendChild(div);
    })

}

(async()=>{
    await fetchImage()
})()