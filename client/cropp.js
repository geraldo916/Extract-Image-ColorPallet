const cropBox = document.getElementById('crop-box');
const boxContainer = document.getElementById('canvas-container');

class Cropper{
    mouseState = null;
    startX ;
    startY;
    endX;
    endY;
    constructor(){
        this.mouseState = null;
        this.startX = cropBox.offsetLeft;
        this.startY = cropBox.offsetTop;
        this.endX = cropBox.offsetWidth + cropBox.offsetLeft;
        this.endY = cropBox.offsetHeight + cropBox.offsetTop;
    }

    getCoordenates(){
        console.log(cropBox.offsetWidth,cropBox.offsetLeft)
        return {
            startX:this.startX,
            startY:this.startY,
            endX: this.endX,
            endY: this.endY
        }
    }
}