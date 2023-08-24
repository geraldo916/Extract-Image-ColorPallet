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
    constructor(){
        this.mouseState = null;
        console.log(cropBox.offsetLeft)
        this.startX = cropBox.offsetLeft;
        this.startY = cropBox.offsetTop;
        this.endX = cropBox.offsetWidth + cropBox.offsetLeft;
        this.endY = cropBox.offsetHeight + cropBox.offsetTop;
        this.width = cropBox.clientWidth;
        this.height = cropBox.clientHeight;
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

                if(pixelToMoveX != 0){
                    cropBox.style.transform = `translateX(${pixelToMoveX}px)`
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