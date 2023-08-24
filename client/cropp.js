const cropBox = document.getElementById('crop-box');
const boxContainer = document.getElementById('canvas-container');

class Cropper{
    mouseState = null;
    startX ;
    startY;
    endX;
    endY;
    width;
    height;
    cropBoxLeftBounding;
    cropBoxTopBounding;
    constructor(parentLeft, parentTop){
        this.cropBoxLeftBounding = Math.round(cropBox.getBoundingClientRect().left);
        this.cropBoxTopBounding = Math.round(cropBox.getBoundingClientRect().top);
        this.mouseState = null;
        this.startX = this.cropBoxLeftBounding - parentLeft;
        this.startY = this.cropBoxTopBounding - parentTop;
        this.endX = cropBox.offsetWidth + this.startX;
        this.endY = cropBox.offsetHeight + this.startY;
        this.width = cropBox.clientWidth;
        this.height = cropBox.clientHeight;
        console.log("Crop Left - Top:",this.startX,this.startY);
    }

    /**
     * @returns 
     */
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
        let movedPixelsX = 0;
        let movedPixelsY = 0;
        let pixelToMoveX = 0;
        let pixelToMoveY = 0;

        cropBox.addEventListener('mousedown',(e)=>{
            this.mouseState = 'move';
            startX = e.clientX;
            startY = e.clientY;
        })
        
        boxContainer.addEventListener('mousemove',(e)=>{
            if(this.mouseState === 'move'){
                movedPixelsX = e.clientX;
                movedPixelsY = e.clientY;
                pixelToMoveX = movedPixelsX - startX;
                pixelToMoveY = movedPixelsY - startY;

                if(pixelToMoveX != 0 || pixelToMoveY != 0){
                    cropBox.style.transform = `translateX(${pixelToMoveX}px) translateY(${pixelToMoveY}px)`
                }
            }
        })

        boxContainer.addEventListener('mouseup',(e)=>{
            this.mouseState = 'not drawing';
            this.startX = pixelToMoveX < 0 ? 0 : pixelToMoveX;
            this.startY = pixelToMoveY < 0 ? 0 : pixelToMoveY;

            this.endX = this.startX + this.width;
            this.endY = this.startY + this.height;
            let coords = this.getCoordenates();
        })

    }


}