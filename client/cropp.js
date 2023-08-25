const cropBox = document.getElementById('crop-box');
const boxContainer = document.getElementById('crop-limitator');

class Cropper{
    mouseState;
    startX;
    startY;
    endX;
    endY;
    width;
    height;
    cropBoxLeftBounding;
    cropBoxTopBounding;
    parentLeft;
    parentTop;
    parentWidth;
    parentHeight;
    constructor(parentLeft, parentTop,parentWidth,parentHeight){
        this.mouseState = null;
        this.parentLeft = parentLeft;
        this.parentTop = parentTop;
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;
        this.cropBoxLeftBounding = Math.round(cropBox.getBoundingClientRect().left);
        this.cropBoxTopBounding = Math.round(cropBox.getBoundingClientRect().top);
        this.startX = this.cropBoxLeftBounding - this.parentLeft;
        this.startY = this.cropBoxTopBounding - this.parentTop;
        this.width = cropBox.clientWidth;
        this.height = cropBox.clientHeight;
        this.endX = cropBox.offsetWidth + this.startX;
        this.endY = cropBox.offsetHeight + this.startY;
    }

    /**
     * @returns 
     */
    getCoordenates(){
        let inicialcropBoxLeftBounding = Math.round(cropBox.getBoundingClientRect().left);
        let inicialcropBoxTopBounding = Math.round(cropBox.getBoundingClientRect().top);
        let inicialstartX = inicialcropBoxLeftBounding - this.parentLeft;
        let inicialstartY = inicialcropBoxTopBounding - this.parentTop;
        let inicialendX = cropBox.offsetWidth + inicialstartX;
        let inicialendY = cropBox.offsetHeight + inicialstartY;

        return {
            startX: inicialstartX,
            startY: inicialstartY,
            endX:  inicialendX,
            endY:  inicialendY
        }
    }

    /**
     * @returns 
     */
    getInicialCoords(){
        return {
            startX: this.startX,
            startY: this.startY,
            endX:  this.endX,
            endY:  this.endY
        }
    }

    moveCropBox(){
        let startX = 0;
        let startY = 0;
        let pixelToMoveX = 0;
        let pixelToMoveY = 0;

        cropBox.addEventListener('mousedown',(e)=>{
            startX = e.clientX;
            startY = e.clientY;
            this.mouseState = 'move';
        })
        
        boxContainer.addEventListener('mousemove',(e)=>{
            if(this.mouseState === 'move'){
                let coords = this.getInicialCoords();
                pixelToMoveX = e.clientX - startX + coords.startX;
                pixelToMoveY = e.clientY - startY + coords.startY;
                
                if(pixelToMoveX >= 0 || pixelToMoveY >= 0){
                    cropBox.style.transform = `translateX(
                        ${pixelToMoveX < 0 ? 0 : pixelToMoveX+this.width-2 < this.parentWidth ? pixelToMoveX: this.parentWidth-this.width-2}px) translateY(${pixelToMoveY < 0 ? 0 : pixelToMoveY+this.height-2 < this.parentHeight?pixelToMoveY:this.parentHeight-this.height}px)`
                }
            }
        })

        window.addEventListener('mouseup',(e)=>{
            this.mouseState = 'not drawing';
            let coords = this.getCoordenates();
            this.startX = coords.startX;
            this.startY = coords.startY;
            this.endX = coords.endX;
            this.endY = coords.endY;
            
        })

    }


}