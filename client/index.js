const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');
const box = document.getElementById('box');
const boxTwo = document.getElementById('boxTwo');
const pallet = document.getElementById("pallete");
const cropLimitator = document.getElementById("crop-limitator");
const AMBIENT_SIZE = 40
let totalVariantColors = []


async function fetchImage(){
    const data = await fetch(URL_API);
    const blob = await data.blob()
    const url = URL.createObjectURL(blob);
    buildImage(url);
}

const buildImage = (blobUrl) => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    const image = new Image();
    const crop = new Cropper();
    crop.moveCropBox()

    image.onload = () => {
        
        const imageAspectRatio = image.width / image.height;
        const canvasAspectRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight;
        
        if(imageAspectRatio > canvasAspectRatio){
            drawWidth = canvas.width;
            drawHeight = canvas.width / imageAspectRatio;
        }else{
            drawHeight = canvas.height;
            drawWidth = canvas.height * imageAspectRatio;
        }

        const drawX = (canvas.width - drawWidth) / 2;
        const drawY = (canvas.height - drawHeight) / 2;

        image.width = drawWidth;
        image.height = drawHeight;
        cropLimitator.style.width = drawWidth+"px";
        cropLimitator.style.height = drawHeight+"px";

        cropLimitator.style.transform = `translateX(${drawX}px) translateY(${drawY}px)`;
        //context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, drawX, drawY, image.width, image.height);

        const coords = crop.getCoordenates();
        
        console.log(coords)

        console.log("Canvas Width and Height:",canvas.width, canvas.height);
        console.log("Image Width and Height:",image.width,image.height);
        console.log("Draw Width and Height:",Math.round(drawWidth),Math.round(drawHeight));
        console.log("Draw coordenates:",Math.round(drawX),Math.round(drawY));

        const imageData = context.getImageData(drawX,drawY, image.width, image.height);

        const rgbaColors = extractImageColors(imageData.data);

        const imageMatrix = transformImageInto2dMatrix(rgbaColors,image.width);

        const pallet = extractPalletColorXY(imageMatrix,coords.startY,coords.endY,coords.startX,coords.endX)

        const quantizationPallet = medianCutQuantization(pallet,0,8);
        const palletColors = generatePallet(quantizationPallet);

        const color = createAmbienteMode(quantizationPallet);
        document.getElementById('ambient-mode').style.backgroundImage = `linear-gradient(to bottom,rgba(${color.r},${color.g},${color.b},0.949) 28%, transparent)`
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

const medianCutQuantization = (rgbaColors, depth, colorDepth) => {
    const COLOR_DEPHT = colorDepth;

    if(depth === COLOR_DEPHT || rgbaColors.length === 0){
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
    rgbaColors.sort((p1,p2) => p2[biggestChannelRange] - p1[biggestChannelRange]);

    const mid = rgbaColors.length / 2;
    return [
        ...medianCutQuantization(rgbaColors.slice(0, mid), depth + 1,colorDepth),
        ...medianCutQuantization(rgbaColors.slice(mid + 1), depth + 1,colorDepth),
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

/**
 * Calculate the color distance between two colors using euclidean distance
 * @param {*} color1 
 * @param {*} color2 
 */

const calculateColorDistance = (color1, color2) => {
    const rDifference = Math.pow(parseInt(color2.r) - parseInt(color1.r),2);
    const gDifference = Math.pow(parseInt(color2.g) - parseInt(color1.g),2);
    const bDifference = Math.pow(parseInt(color2.b) - parseInt(color1.b),2);

    return rDifference + gDifference + bDifference;
}

const transformImageInto2dMatrix = (colorArray,imageWidth) => {

    const imageMatrixLength = Math.round(colorArray.length / imageWidth);
    let imageMatrix = new Array(imageMatrixLength);

    for(let i = 0; i < imageMatrixLength; i++){
        imageMatrix[i] = colorArray.slice((i*imageWidth), (i+1)*imageWidth)
    }

    return imageMatrix
}

const generatePallet = (pixels) => {
    const realPallet = [];
    for(let index = 0; index < pixels.length; index++){

        if(index > 0){
            const diff = calculateColorDistance(pixels[index], pixels[index - 1]);
            if(diff < 4094){
                continue;
            }
        }
        
        if(pixels[index].r){
            const div = document.createElement("div");
            const background = `rgba(${pixels[index].r},${pixels[index].g},${pixels[index].b},1)`;
            div.style.width = `120px`;
            div.style.height = "120px";
            div.style.backgroundColor = background;
            pallet.appendChild(div);
            realPallet.push(pixels[index])
        }
        
    }
    return realPallet;
}

const extractPalletColorXY = (imageMatrix, yStart, yEnd, xStart, xEnd) => {
    const pixels = [];
    for(let i = 0; i < imageMatrix.length; i++){
        if(i >= yStart && i <= yEnd){
            for(let j = 0; j < imageMatrix[i].length; j++){
                if(j >=  xStart && j <= xEnd){
                    pixels.push(imageMatrix[i][j])
                }
            }
        } 
    }
    return pixels;
}

/**
 * @param {Array} colors 
 * @param {HTMLElement} mainElement 
 */

const createAmbienteMode = (colors) => {
    for(let j = 0; j < colors.length; j++){
        if( j > 0){
            const diff = calculateColorDistance(colors[j], colors[j-1]);
            if(diff < 4094){
                continue;
            }
            totalVariantColors.push(colors[j])
        }
    }
    
    if(totalVariantColors.length === 1){
        return totalVariantColors[0];
    }
    return totalVariantColors[1]
    
}

(async()=>{
    await fetchImage();
})()