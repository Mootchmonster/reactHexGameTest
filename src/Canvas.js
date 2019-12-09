import React, {Component} from 'react';
import './index.css';

export default class Canvas extends Component{
constructor(props){
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
        hexSize: 20,
        hexOrigin: {x: 400, y:300},
        currentHex: {c:0, r:0, s:0, x:0, y:0},
        playerPosition: {c:0, r:0, s:0, x:0, y:0}
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

    shouldComponentUpdate(nextProps, nextState){
        if(nextState.currentHex !== this.state.currentHex){
            const {c,r,s,x,y} = nextState.currentHex;
            const {canvasWidth, canvasHeight} = this.state.canvasSize;
            const ctx = this.canvasCoordinates.getContext("2d");
            ctx.clearRect(0,0, canvasWidth, canvasHeight);
            //this.drawNeighbors(this.Hex(c,r,s));
            let currentDistanceLine = nextState.currentDistanceLine;
            for(let i = 0; i <= currentDistanceLine.length - 1; i++){
                if(i == 0){
                    this.drawHex(this.canvasCoordinates, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "black", 1, "red");
                }
                else{
                    this.drawHex(this.canvasCoordinates, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "black", 1, "grey");
                }
            }
            this.drawHex(this.canvasCoordinates, this.Point(x,y), "black", 1, "grey");
            return true;
        }
        return false;
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
        var p = 0;
        for(let r = 0; r<= rBottomSide; r++){
            if(r%2 === 0 && r !==0){
                p++
            }
            for(let c = -cLeftSide; c <= cRightSide; c++){
                //deconstruct hexToPixel result
                const{x,y}= this.hexToPixel(this.Hex(c-p,r));
                if((x > width/2 && x < canvasWidth - width/2 ) && (y > height/2 && y < canvasHeight - height/2)){

                    this.drawHex(this.canvasHex, this.Point(x,y), "black", 1, "grey");
                    //this.drawHexCords(this.canvasHex, this.Point(x,y), this.Hex(c-p,r,-(c-p)-r));
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
                    this.drawHex(this.canvasHex, this.Point(x,y), "black", 1, "grey");
                    //this.drawHexCords(this.canvasHex, this.Point(x,y), this.Hex(c+n,r,-(c+n)-r));
                }
            }
        }
    }

    drawHex(canvasID, center, lineColor, width, fillColor){
        for(let i = 0; i <= 5; i++){
            let start = this.getHexCornerCord(center, i);
            let end = this.getHexCornerCord(center, i+1);
            this.fillHex(canvasID, center, fillColor);
            this.drawLine(canvasID, start, end, lineColor, width);
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

    fillHex(canvasID, center, fillcolor){
        let corner0 = this.getHexCornerCord(center, 0);
        let corner1 = this.getHexCornerCord(center, 1);
        let corner2 = this.getHexCornerCord(center, 2);
        let corner3 = this.getHexCornerCord(center, 3);
        let corner4 = this.getHexCornerCord(center, 4);
        let corner5 = this.getHexCornerCord(center, 5);
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = fillcolor;
        ctx.globalAlpha = 0.1;
        ctx.moveTo(corner0.x, corner0.y);
        ctx.lineTo(corner1.x, corner1.y);
        ctx.lineTo(corner2.x, corner2.y);
        ctx.lineTo(corner3.x, corner3.y);
        ctx.lineTo(corner4.x, corner4.y);
        ctx.lineTo(corner5.x, corner5.y);
        ctx.closePath();
        ctx.fill();

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

    cubeDirection(direction){
        const cubeDirections = [this.Hex(1,0,-1), this.Hex(1,-1,0), this.Hex(0,-1,1),
                                this.Hex(-1,0,1), this.Hex(-1,1,0), this.Hex(0,1,-1)]
        return cubeDirections[direction];
    }

    cubeAdd(a,b){
        return this.Hex(a.c + b.c, a.r + b.r, a.s + b.s);
    }

    cubeSubtract(hexA, hexB){
        return this.Hex(hexA.c - hexB.c, hexA.r - hexB.r, hexA.s - hexB.s);
    }

    getCubeNeighbor(h, direction){
        return this.cubeAdd(h,this.cubeDirection(direction));
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

    getDistanceLine(hexA, hexB){
        let dist = this.cubeDistance(hexA, hexB);
        var arr = [];
        for (let i = 0; i <= dist; i++){
            let center = this.hexToPixel(this.cubeRound(this.cubeLinearInt(hexA, hexB, 1.0 / dist * i)));
            arr = [].concat(arr, center);
        }
        this.setState({
            currentDistanceLine: arr
        });
    }

    cubeDistance(hexA, hexB){
        const {c,r,s} = this.cubeSubtract(hexA, hexB)
        return (Math.abs(c) + Math.abs(r) + Math.abs(s))/2;
    }

    cubeLinearInt(hexA, hexB, t){
        return this.Hex(this.linearInt(hexA.c, hexB.c, t), this.linearInt(hexA.r, hexB.r, t), this.linearInt(hexA.s, hexB.s, t));
    }

    linearInt(a,b,t){
        return (a + (b-a) * t);
    }

    Point(x,y){
        return {x: x, y: y}
    }

    //property names here must match names of those passed in?? from drawHexes()
    Hex(c, r, s) {
        return{c: c, r: r, s:s}
    }

    drawNeighbors(currentHex){
        for(let i = 0; i <= 5; i++){
            const {c,r,s} = this.getCubeNeighbor(this.Hex(currentHex.c, currentHex.r, currentHex.s), i);
            const {x,y} = this.hexToPixel(this.Hex(c,r,s));
            this.drawHex(this.canvasCoordinates, this.Point(x,y), "red", 2);
        }
    }

    handleMouseMove(e){
        //onMouseMove = {this.handleMouseMove} => handleMouseMove
        //componentDidMount => this.getCanvasPosition(this.canvasCoordinates); => canvasPosition
        const {left, right, top, bottom} = this.state.canvasPosition;
        const {canvasWidth, canvasHeight} = this.state.canvasSize;
        const {width, height, verticalDist, horizDist} = this.state.hexParameters;
        let offsetX = e.pageX - left;
        let offsetY = e.pageY - top;
        const {c,r,s} = this.cubeRound( this.pixelToHex(this.Point(offsetX,offsetY)));
        const {x, y} = this.hexToPixel(this.Hex(c,r,s));
        let playerPosition = this.state.playerPosition;
        this.getDistanceLine(this.Hex(playerPosition.c, playerPosition.r, playerPosition.s), this.Hex(c,r,s));
        if((x > width/2 && x < canvasWidth - width/2 ) && (y > height/2 && y < canvasHeight - height/2)){
        this.setState({
            currentHex: {c,r,s,x,y}
        })
    }   
    }

    handleClick(e){
        this.setState({
            playerPosition: this.state.currentHex
        })
    }

    render(){
        return (
            <div className="App">
                <canvas ref={canvasHex => this.canvasHex = canvasHex} ></canvas>
                <canvas ref={canvasCoordinates => this.canvasCoordinates = canvasCoordinates} onMouseMove = {this.handleMouseMove}
                onClick = {this.handleClick} ></canvas>
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