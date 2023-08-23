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
        return {
            startX:this.startX,
            startY:this.startY,
            endX: this.endX,
            endY: this.endY
        }
    }

    moveCropBox(){
        let startX = 0;
        let startY = 0;
        cropBox.addEventListener('mousedown',(e)=>{
            this.mouseState = 'move';
            startX = e.clientX;
            startY = e.clientY;
        })
        
        boxContainer.addEventListener('mousemove',(e)=>{
            if(this.mouseState === 'move'){
                let movedPixelsX = e.clientX;
                let movedPixelsY = e.clientY;
                let pixelToMoveX = movedPixelsX - startX;
                let pixelToMoveY = movedPixelsY - startY;
                if(pixelToMoveX != 0){
                    cropBox.style.transform = `translateX(${pixelToMoveX}px)`
                }
            }
        })

        boxContainer.addEventListener('mouseup',(e)=>{
            this.mouseState = 'not drawing'
            console.log("Not Drawing")
        })

    }


}