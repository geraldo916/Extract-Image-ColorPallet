let cropBox = document.getElementById('crop-box');
let cropIntern = document.getElementById('crop-intern');
const boxContainer = document.getElementById('crop-limitator');

const TEMPLATE = `
    <div id="crop-box" class="crop-box">
        <span id="crop-intern"></span>
        <span id="point-right-up" class="point point-right point-right-down"></span>
    </div>
`

class Cropper{

    template = TEMPLATE;

    constructor(parentLeft, parentTop,parentWidth,parentHeight){
        this.parentLeft = parentLeft;
        this.parentTop = parentTop;
        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;
        this.mouseState = null;
    }

    render(){
        boxContainer.innerHTML = this.template;
        cropBox    = this.elementSelectorDOM('crop-box');
        cropIntern = this.elementSelectorDOM('crop-intern');
        cropBox.style.width = '140px';

        this.cropBoxLeftBounding = Math.round(cropBox.getBoundingClientRect().left);
        this.cropBoxTopBounding = Math.round(cropBox.getBoundingClientRect().top);

        this.startX = this.cropBoxLeftBounding - this.parentLeft;
        this.startY = this.cropBoxTopBounding  - this.parentTop;
        this.endX   = cropBox.offsetWidth  + this.startX;
        this.endY   = cropBox.offsetHeight + this.startY;

        this.width  = cropBox.clientWidth;
        this.height = cropBox.clientHeight;
        
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
            endX: inicialendX,
            endY: inicialendY,
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
            endY:  this.endY,
            width: this.width,
            height: this.height
        }
    }

    moveCropBox(){
        let startX = 0;
        let startY = 0;
        let pixelToMoveX = 0;
        let pixelToMoveY = 0;

        cropIntern.addEventListener('mousedown',(e)=>{
            startX = e.clientX;
            startY = e.clientY;
            this.mouseState = 'move';
        })
        
        boxContainer.addEventListener('mousemove',(e)=>{
            if(this.mouseState === 'move'){
                let coords   = this.getInicialCoords();
                pixelToMoveX = e.clientX - startX + coords.startX;
                pixelToMoveY = e.clientY - startY + coords.startY;
                
                if(pixelToMoveX >= 0 || pixelToMoveY >= 0){
                    cropBox.style.transform = `translateX(
                        ${pixelToMoveX < 0 ? 0 : pixelToMoveX+this.width-2 < this.parentWidth ? pixelToMoveX: this.parentWidth-this.width-2}px) translateY(${pixelToMoveY < 0 ? 0 : pixelToMoveY+this.height-2 < this.parentHeight?pixelToMoveY:this.parentHeight-this.height}px)`
                }
            }
        })

        window.addEventListener('mouseup',(e)=>{
            let coords = this.getCoordenates();
            this.mouseState = 'not drawing';
            this.startX = coords.startX;
            this.startY = coords.startY;
            this.endX = coords.endX;
            this.endY = coords.endY;
        })

    }

    /**
     * @param {string} elementID 
     * @returns {HTMLElement}
     */
    elementSelectorDOM(elementID){
        return document.getElementById(elementID)
    }

    resizeCropBox(){
        const rightPoint = document.getElementById("point-right-up");
        let startX = 0;
        let startY = 0;
        let pixelToMoveX = 0;
        let pixelToMoveY = 0;

        rightPoint.addEventListener('mousedown',(e)=>{
            startX = e.clientX;
            startY = e.clientY;
            this.mouseState = 'resize';
        })

        boxContainer.addEventListener('mousemove',(e)=>{
            if(this.mouseState === 'resize'){
                pixelToMoveX = e.clientX - startX;
                pixelToMoveY = e.clientY - startY;
               
                let pixelWidth = (((pixelToMoveX * 100) / this.width) / 100) * this.width;
                let pixelHeight = (((pixelToMoveY * 100) / this.height) / 100) * this.height;
                
                cropBox.style.width = `${this.width + pixelWidth}px`;
                cropBox.style.height = `${this.height + pixelHeight}px`;
                
            }
        })

        window.addEventListener('mouseup',(e)=>{
            this.mouseState = 'not resizing';
            this.width = cropBox.offsetWidth;
            this.height = cropBox.offsetHeight;
        })

    }


}