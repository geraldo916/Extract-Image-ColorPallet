const pallet = document.getElementById("pallete");
const cropLimitator = document.getElementById("crop-limitator");
const createPalleteBtn = document.getElementById("create-pallet");
const imgWidth = document.getElementById("width-inf");
const imgHeight = document.getElementById("height-inf");
const imgAspectRatio = document.getElementById("ratio-info");
const imageFile = document.getElementById("image-file");
let totalVariantColors = []
let realPallet = [];
let imageSpecification = {
    imageRawData:null,
    imageDrawWidth: 0,
    imageDrawHeight: 0,
    imageDrawX:0,
    imageDrawY:0
}

imageFile.addEventListener('change', async (event) => {
    await buildImage();
    initCrop();
});
createPalleteBtn.onclick = () => {
    initCrop();
}


function initCrop(){
    const imageContainerLeft = Math.round(cropLimitator.getBoundingClientRect().left);
    const imageContainerTop = Math.round(cropLimitator.getBoundingClientRect().top);
    const imageContainerWidth = Math.round(cropLimitator.getBoundingClientRect().width);
    const imageContainerHeight = Math.round(cropLimitator.getBoundingClientRect().height);

    const crop = new Cropper(imageContainerLeft,imageContainerTop,imageContainerWidth,imageContainerHeight);
            
    crop.resizeCropBox();
    crop.moveCropBox();
    
}

async function buildImage(){
    const canvas = document.getElementById("canvas");
    const image = new Image();
    const fileReader = new FileReader();
    const choosenFile = imageFile.files[0];

    fileReader.readAsDataURL(choosenFile);

    fileReader.onload = () => {
        image.src = fileReader.result;
        image.onload = () => {
            const context = canvas.getContext("2d");
            const imageAspectRatio = image.width / image.height;
            const canvasAspectRatio = canvas.width / canvas.height;
            
            imgWidth.innerText = image.width;
            imgHeight.innerText = image.height;
            imgAspectRatio.innerText = imageAspectRatio.toFixed(1);
            
            if(imageAspectRatio > canvasAspectRatio){
                imageSpecification.imageDrawWidth = canvas.width;
                imageSpecification.imageDrawHeight = canvas.width / imageAspectRatio;
            }else{
                imageSpecification.imageDrawHeight = canvas.height;
                imageSpecification.imageDrawWidth = canvas.height * imageAspectRatio;
            }
    
            imageSpecification.imageDrawX = (canvas.width - imageSpecification.imageDrawWidth) / 2;
            imageSpecification.imageDrawY = (canvas.height - imageSpecification.imageDrawHeight) / 2;
    
            image.width = imageSpecification.imageDrawWidth;
            image.height = imageSpecification.imageDrawHeight;
            cropLimitator.style.width = image.width+"px";
            cropLimitator.style.height = image.height+"px";
    
            cropLimitator.style.transform = `translateX(${imageSpecification.imageDrawX}px) translateY(${imageSpecification.imageDrawY}px)`;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, imageSpecification.imageDrawX, imageSpecification.imageDrawY, image.width, image.height);

            imageSpecification.imageRawData = context.getImageData(imageSpecification.imageDrawX,imageSpecification.imageDrawY, image.width, image.height).data;

        }
    }
}

/**
 * @param {number} imageWidth 
 * @param {Uint16Array} imageData 
 */
const init = (imageWidth,imageData) => {    
    const colorsPalete = document.querySelectorAll('.color-item');
    totalVariantColors = [];
    realPallet = [];
    colorsPalete.forEach(item=>{
        item.remove()
    })
                
    const coords = crop.getCoordenates();
    
    const rgbaColors = extractImageColors(imageData);
    
    const imageMatrix = transformImageInto2dMatrix(rgbaColors,imageWidth);
    
    const pallete = extractPalletColorXY(imageMatrix,coords.startY,coords.endY,coords.startX,coords.endX)
    
    const quantizationPallet = medianCutQuantization(pallete,0,8);
    generatePallet(quantizationPallet);
    createAmbienteMode(quantizationPallet);
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
    for(let index = 0; index < pixels.length; index++){

        if(index > 0){
            const diff = calculateColorDistance(pixels[index], pixels[index - 1]);
            if(diff < 2094){
                continue;
            }
        }
        
        if(pixels[index].r){
            const div = document.createElement("div");
            div.classList.add("color-item")
            const background = `rgba(${pixels[index].r},${pixels[index].g},${pixels[index].b},1)`;
            div.style.width = `120px`;
            div.style.height = "120px";
            div.style.backgroundColor = background;
            div.innerText = `#${pixels[index].r.toString("16")}${pixels[index].g.toString("16")}${pixels[index].b.toString("16")}`

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
        let color = totalVariantColors[0];
        document.getElementById('ambient-mode').style.backgroundImage = `linear-gradient(to bottom,rgba(${color.r},${color.g},${color.b},0.949) 28%, transparent)`
    }
    let color = totalVariantColors[0];
    document.getElementById('ambient-mode').style.backgroundImage = `linear-gradient(to bottom,rgba(${color.r},${color.g},${color.b},0.949) 28%, transparent)`
    
}
