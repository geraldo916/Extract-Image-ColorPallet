const URL_API = 'http://localhost:8080';
const imageContainer = document.getElementById('image');

async function fetchImage(){
    const data = await fetch(URL_API);
    const reader = data.body
    /*const blob = await data.blob()
    const url = URL.createObjectURL(blob);
    const imgElement = document.createElement('img');
    imgElement.src = url;
    imageContainer.appendChild(imgElement);*/
    reader.pipeThrough(
        new TransformStream(new GetColorsImage())
    ).pipeTo(
        new WritableStream({
            write(chunk,controller){
                console.log('chunk')
            }
        })
    )

}

(async()=>{
    await fetchImage()
})()

class GetColorsImage{
    constructor(){
        this._mode = 'header';
    }

    /**
     * @param {Uint8Array} chunk 
     * @param {TransformStreamDefaultController} controller 
     */
    transform(chunk,controller){
        let position = chunk.byteOffset;
        let length = chunk.byteLength
        let source = new DataView(chunk.buffer, position,length);

        //while(position < 40){
            switch(this._mode){
                case 'header':{
                    position += 16;
                    this._width = source.getUint32(position);
    
                    position += 4;
                    this._height = source.getUint32(position);
    
                    position += 4;
                    this._bitDepht = source.getUint8(position);
    
                    position += 1;
                    this._colorType = source.getUint8(position);
    
                    position += 1;
                    this._compression = source.getUint8(position);
    
                    position += 1;
                    this._filter = source.getUint8(position);
    
                    position += 1
                    this._interlace =source.getUint8(position);
                    position += 5;
    
                    console.log("Width: ", this._width);
                    console.log("Height:", this._height);
                    console.log("Color Type:", this._colorType);
                    console.log("PNG Bit Depht:",this._bitDepht)
                    console.log("PNG Compression:", this._compression);
                    console.log("PNG Filter:",this._filter)
    
                    this._mode = 'data'
                    
                }
                case 'data':{
                    const dataSize = source.getUint32(position);
                    console.log("PNG Size:",dataSize)

                    const chunkName = this.readString(source, position+4,4);

                    const bytesPerPixel = this.bytesPerPixel();
                    const bytesPerRow= this._width * bytesPerPixel +1;



                    let result = chunk.subarray(position + 8,length)
                    
                    this.getColors(result,bytesPerPixel,bytesPerRow)

                    this._mode =' end'
                    break
                }
                case 'end':{
                    
                    return;
                }
            }
        //}
        controller.enqueue(chunk)
        //console.log(magic1.toString(16) + '0' + magic2.toString(16))
        
    }
    /**
     * @param {DataView} dataView 
     * @param {number} position 
     * @param {number} length 
     * @returns 
     */
    readString(dataView, position, length){
        return new Array(length)
            .fill(0)
            .map((e, index) => String.fromCharCode(dataView.getUint8(position + index))).join('');
    }

    bytesPerPixel(){
        if(this._bitDepht < 8){
            throw new Error("Bit depths below 8 bit are currently not suported");
        }

        const byteDepth = this._bitDepht / 8;
        if(this._colorType === 0){
            return byteDepth;
        }
        if(this._colorType === 2){
            return 3 * byteDepth;
        }
        if(this._colorType === 3){
            return byteDepth;
        }
        if(this._colorType === 4){
            return 2 * byteDepth;
        }

        return 4 * byteDepth;
    }

    getColors(src, bytesPerPixel, bytesPerRow){
        
    }
}