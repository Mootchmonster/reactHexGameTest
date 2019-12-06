import React, {Component} from 'react';
import './index.css';

export default class Canvas extends Component{
constructor(props){
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = {
        hexSize: 20,
        hexOrigin: {x: 400, y:300}
    }
}

    componentWillMount(){
        let hexParams = this.getHexParams();
        this.setState({
            canvasSize: { canvasWidth: 800, canvasHeight: 600},
            hexParameters: hexParams
        })
    }
    componentDidMount(){
        const {canvasWidth, canvasHeight} = this.state.canvasSize;
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;
        this.canvasCoordinates.width = canvasWidth;
        this.canvasCoordinates.height = canvasHeight;
        this.getCanvasPosition(this.canvasCoordinates);
        this.drawHexes();
    }   

    componentUpdate(nextProps, nextState){
        
    }

    drawHexes(){
        const {canvasWidth, canvasHeight} = this.state.canvasSize;
        //deconstructing hexParameters
        const {width, height, verticalDist, horizDist} = this.state.hexParameters;
        const hexOrigin = this.state.hexOrigin;
        let cLeftSide = Math.round(hexOrigin.x / horizDist);
        let cRightSide = Math.round((canvasWidth - hexOrigin.x)/horizDist);
        let rTopSide = Math.round(hexOrigin.y /verticalDist);
        let rBottomSide = Math.round((canvasHeight - hexOrigin.y)/verticalDist);
        console.log(cLeftSide, cRightSide, rTopSide, rBottomSide);
        var p = 0;
        for(let r = 0; r<= rBottomSide; r++){
            if(r%2 === 0 && r !==0){
                p++
            }
            for(let c = -cLeftSide; c <= cRightSide; c++){
                //deconstruct hexToPixel result
                const{x,y}= this.hexToPixel(this.Hex(c-p,r));
                if((x > width/2 && x < canvasWidth - width/2 ) && (y > height/2 && y < canvasHeight - height/2)){
                    this.drawHex(this.canvasHex, this.Point(x,y));
                    this.drawHexCords(this.canvasHex, this.Point(x,y), this.Hex(c-p,r,-c-r));
                }
            }
        }
        var n = 0;
        for(let r = -1; r >= -rTopSide; r--){
            if(r%2 !== 0){
                n++
            }
            for(let c = -cLeftSide; c <= cRightSide; c++){
                //deconstruct hexToPixel result
                const{x,y}= this.hexToPixel(this.Hex(c+n,r));
                if((x > width/2 && x < canvasWidth - width/2 ) && (y > height/2 && y < canvasHeight - height/2)){
                    this.drawHex(this.canvasHex, this.Point(x,y));
                    this.drawHexCords(this.canvasHex, this.Point(x,y), this.Hex(c+n,r,-c-r));
                }
            }
        }
    }

    drawHex(canvasID, center, color, width){
        for(let i = 0; i <= 5; i++){
            let start = this.getHexCornerCord(center, i);
            let end = this.getHexCornerCord(center, i+1);
            this.drawLine(canvasID, {x:start.x, y:start.y}, {x: end.x, y: end.y}, color, width);
            
        }
    }

    drawLine(canvasID, start, end, color, width) {
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    drawHexCords(canvasID, center, h){
        const ctx = canvasID.getContext("2d");
        //shows column number
        ctx.fillText(h.c, center.x+6, center.y);
        //shows row number
        ctx.fillText(h.r, center.x-3, center.y+15);
        //shows cube value number
        ctx.fillText(h.s, center.x-12, center.y);

    }

    getHexCornerCord(center, i) {
        let angle_deg = 60 * i - 30;
        let angle_rad = Math.PI / 180 * angle_deg;
        let x = center.x + this.state.hexSize * Math.cos(angle_rad);
        let y = center.y + this.state.hexSize * Math.sin(angle_rad);
        return this.Point(x,y);
    }

    getHexParams(){
        let height = this.state.hexSize * 2;
        let width = Math.sqrt(3)/2 * height;
        let verticalDist = height * 3/4;
        let horizDist = width;
        return {width, height, verticalDist, horizDist}
    }

    getCanvasPosition(canvasID){
        //getBoundingClientRect appears to be made up so should be instanciated??
        let rect = canvasID.getBoundingClientRect();
        this.setState({
            canvasPosition: { left:rect.left, right:rect.right, top:rect.top, bottom: rect.bottom }
        })
    }

    hexToPixel(h){
        //hexOrigin positions hex grid on screen
        let hexOrigin = this.state.hexOrigin;
        let x = this.state.hexSize * Math.sqrt(3) * (h.c + h.r/2) + hexOrigin.x;
        let y = this.state.hexSize * 3/2 * h.r + hexOrigin.y;
        return this.Point(x,y); 
    }

    pixelToHex(point){
        //https://www.redblobgames.com/grids/hexagons/#pixel-to-hex
        let size = this.state.hexSize;
        let origin = this.state.hexOrigin;
        let c = ((point.x - origin.x) * Math.sqrt(3)/3 - (point.y - origin.y)/3) / size
        let r = (point.y - origin.y) * 2/3 / size
        return this.Hex(c, r, -c-r);
    }

    cubeRound(cube){
        var rx = Math.round(cube.c)
        var ry = Math.round(cube.r)
        var rz = Math.round(cube.s)
    
        var x_diff = Math.abs(rx - cube.c)
        var y_diff = Math.abs(ry - cube.r)
        var z_diff = Math.abs(rz - cube.s)
    
        if (x_diff > y_diff && x_diff > z_diff){
            rx = -ry-rz;
        }
        else if (y_diff > z_diff){
            ry = -rx-rz;
        }
        else{
            rz = -rx-ry;
        }
        return this.Hex(rx, ry, rz)
    }


    Point(x,y){
        return {x: x, y: y}
    }

    //property names here must match names of those passed in?? from drawHexes()
    Hex(c, r, s) {
        return{c: c, r: r, s:s}
    }

    handleMouseMove(e){
        //onMouseMove = {this.handleMouseMove} => handleMouseMove
        //componentDidMount => this.getCanvasPosition(this.canvasCoordinates); => canvasPosition
        const {left, right, top, bottom} = this.state.canvasPosition;
        let offsetX = e.pageX - left;
        let offsetY = e.pageY - top;
        const {c,r,s} = this.cubeRound( this.pixelToHex(this.Point(offsetX,offsetY)));
        const {x, y} = this.hexToPixel(this.Hex(c,r,s));
        this.drawHex(this.canvasCoordinates, this.Point(x,y), "green", 2);
        console.log(c,r,s);
    }

    render(){
        return (
            <div className="App">
                <canvas ref={canvasHex => this.canvasHex = canvasHex} ></canvas>
                <canvas ref={canvasCoordinates => this.canvasCoordinates = canvasCoordinates} onMouseMove = {this.handleMouseMove} ></canvas>
            </div>
          )
    }
}

// function App() {
//   return (
//     <div className="App">
//         Canvas Test
//         <canvas ref={canvasHex => this.canvasHex = canvasHex} ></canvas>
//     </div>
//   );
// }

//export default App;