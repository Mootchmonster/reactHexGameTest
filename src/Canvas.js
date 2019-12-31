import React, {Component} from 'react';
import './index.css';

var DUMMY_OBSTACLES = ['{"c":1,"r":-2,"s":1}', '{"c":2,"r":-2,"s":0}', '{"c":2,"r":-1,"s":-1}', '{"c":2,"r":0,"s":-2}', 
'{"c":-3,"r":-2,"s":5}', '{"c":-4,"r":-1,"s":5}', '{"c":-5,"r":0,"s":5}', '{"c":-5,"r":1,"s":4}', '{"c":-5,"r":2,"s":3}', 
'{"c":-6,"r":3,"s":3}', '{"c":-6,"r":4,"s":2}', '{"c":-3,"r":6,"s":-3}', '{"c":-2,"r":6,"s":-4}', '{"c":-1,"r":6,"s":-5}', 
'{"c":0,"r":5,"s":-5}', '{"c":1,"r":5,"s":-6}', '{"c":2,"r":5,"s":-7}', '{"c":3,"r":4,"s":-7}', '{"c":3,"r":3,"s":-6}', 
'{"c":4,"r":2,"s":-6}', '{"c":5,"r":1,"s":-6}', '{"c":5,"r":0,"s":-5}', '{"c":5,"r":-7,"s":2}', '{"c":5,"r":-6,"s":1}', 
'{"c":5,"r":-5,"s":0}', '{"c":5,"r":-4,"s":-1}', '{"c":6,"r":-4,"s":-2}', '{"c":7,"r":-4,"s":-3}', '{"c":8,"r":-4,"s":-4}', 
'{"c":-1,"r":-7,"s":8}', '{"c":-2,"r":-6,"s":8}', '{"c":-3,"r":-5,"s":8}', '{"c":-4,"r":-4,"s":8}', '{"c":-5,"r":-4,"s":9}', 
'{"c":-6,"r":-4,"s":10}', '{"c":-7,"r":-4,"s":11}']

export default class Canvas extends Component{
constructor(props){
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
        hexSize: 20,
        hexOrigin: {x: 400, y:300},
        currentHex: {c:0, r:0, s:0, x:0, y:0},
        playerPosition: {c:0, r:0, s:0},
        obstacles: DUMMY_OBSTACLES,
        cameFrom: {},
        hexPathMap: [],
        path: []
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
        this.canvasInteraction.width = canvasWidth;
        this.canvasInteraction.height = canvasHeight;
        this.canvasView.width = canvasWidth;
        this.canvasView.height = canvasHeight;
        this.getCanvasPosition(this.canvasInteraction);
        this.drawHex(this.canvasInteraction, this.Point(this.state.playerPosition.x, this.state.playerPosition.y), 1, "grey", "red", 0.2);
        this.drawHexes();
        //used to load preset list of obstacles
        this.drawObstacles();
    }   

    shouldComponentUpdate(nextProps, nextState){
        if(nextState.currentHex !== this.state.currentHex){
            const {c,r,s,x,y} = nextState.currentHex;
            const {canvasWidth, canvasHeight} = this.state.canvasSize;
            const ctx = this.canvasInteraction.getContext("2d");
            ctx.clearRect(0,0, canvasWidth, canvasHeight);
    
            //this.drawNeighbors(this.Hex(c,r,s));
            let currentDistanceLine = nextState.currentDistanceLine;
            for(let i = 0; i <= currentDistanceLine.length - 1; i++){
                if(i == 0){
                    this.drawHex(this.canvasInteraction, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y),1, "black",  "red");
                }
                else{
                    this.drawHex(this.canvasInteraction, this.Point(currentDistanceLine[i].x, currentDistanceLine[i].y),1, "black",  "grey");
                }
            }
            //used to draw obstacles onclick
            // nextState.obstacles.map((l)=>{
            //     const {c,r,s} = JSON.parse(l);
            //     const {x,y} = this.hexToPixel(this.Hex(c,r,s));
            //     this.drawHex(this.canvasInteraction, this.Point(x,y),1, "black",  "black");
            // })
            this.drawHex(this.canvasInteraction, this.Point(x,y),1, "black",  "grey");
            return true;
        }
        if(nextState.camefrom !== this.state.camefrom){
            const {canvasWidth, canvasHeight} = this.state.canvasSize;
            const ctx = this.canvasView.getContext("2d");
            ctx.clearRect(0,0,canvasWidth, canvasHeight);
            for(let l in nextState.camefrom){
                const {c,r,s} = JSON.parse(l);
                const {x,y} = this.hexToPixel(this.Hex(c,r));
                this.drawHex(this.canvasView, this.Point(x,y), 1,"black", "green", 0.1);
    }
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
        var hexPathMap = [];
        var p = 0;
        for(let r = 0; r<= rBottomSide; r++){
            if(r%2 === 0 && r !==0){
                p++
            }
            for(let c = -cLeftSide; c <= cRightSide; c++){
                //deconstruct hexToPixel result
                const{x,y}= this.hexToPixel(this.Hex(c-p,r));
                if((x > width/2 && x < canvasWidth - width/2 ) && (y > height/2 && y < canvasHeight - height/2)){
                    this.drawHex(this.canvasHex, this.Point(x,y),1, "black",  "grey");
                    //this.drawHexCords(this.canvasHex, this.Point(x,y), this.Hex(c-p,r,-(c-p)-r));
                    var bottomH = JSON.stringify(this.Hex(c-p,r,-(c-p)-r));
                    if(!this.state.obstacles.includes(bottomH)){
                        hexPathMap.push(bottomH);
                    }
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
                    this.drawHex(this.canvasHex, this.Point(x,y),1, "black",  "grey");
                    //this.drawHexCords(this.canvasHex, this.Point(x,y), this.Hex(c+n,r,-(c+n)-r));
                    var topH = JSON.stringify(this.Hex(c+n,r,-(c+n)-r));
                    if(!this.state.obstacles.includes(topH)){
                        hexPathMap.push(topH);
                    }
                }
            }
        }
        //used because we cannot modify the state directly
        hexPathMap = [].concat(hexPathMap);
        this.setState(
            {hexPathMap: hexPathMap},
            this.breadthFirstSearchCallback = () => this.breadthFirstSearch(this.state.playerPosition)
        )
    }

    drawHex(canvasID, center, lineWidth, lineColor, fillColor){
        for(let i = 0; i <= 5; i++){
            let start = this.getHexCornerCord(center, i);
            let end = this.getHexCornerCord(center, i+1);
            this.fillHex(canvasID, center, fillColor);
            this.drawLine(canvasID, start, end, lineWidth, lineColor);
        }
    }

    drawLine(canvasID, start, end, lineWidth, lineColor) {
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineWidth;
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

    getNeighbors(h){
        //h is a hex
        var arr = [];
        for(let i = 0;i <= 5; i++){
            const {c,r,s} = this.getCubeNeighbor(this.Hex(h.c, h.r, h.s), i);
            arr.push(this.Hex(c,r,s));
        }
        return arr;
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
            this.drawHex(this.canvasInteraction, this.Point(x,y), "red", 2);
        }
    }

    handleMouseMove(e){
        //onMouseMove = {this.handleMouseMove} => handleMouseMove
        //componentDidMount => this.getCanvasPosition(this.canvasInteraction); => canvasPosition
        const {left, right, top, bottom} = this.state.canvasPosition;
        const {canvasWidth, canvasHeight} = this.state.canvasSize;
        const {width, height, verticalDist, horizDist} = this.state.hexParameters;
        let offsetX = e.pageX - left;
        let offsetY = e.pageY - top;
        const {c,r,s} = this.cubeRound( this.pixelToHex(this.Point(offsetX,offsetY)));
        const {x, y} = this.hexToPixel(this.Hex(c,r,s));
        let playerPosition = this.state.playerPosition;
        //this.getDistanceLine(this.Hex(playerPosition.c, playerPosition.r, playerPosition.s), this.Hex(c,r,s));
        this.getDistanceLine(this.Hex(0,0,0), this.Hex(c,r,s));
        if((x > width/2 && x < canvasWidth - width/2 ) && (y > height/2 && y < canvasHeight - height/2)){
        this.setState({
            currentHex: {c,r,s,x,y}
        })
    }   
    }

    handleClick(e){
        //used to set obstacles
        //this.addObstacles();
        // this.setState({
        //     playerPosition: this.state.currentHex
        // })
    }

    drawObstacles(){
        this.state.obstacles.map((l) => {
            const {c,r,s} = JSON.parse(l);
            const {x,y} = this.hexToPixel(this.Hex(c,r,s));
            this.drawHex(this.canvasHex, this.Point(x,y), 1, "black", "black");
        })
    }

    // addObstacles(){
    //     const {c,r,s} = this.state.currentHex;
    //     let obstacles = this.state.obstacles;
    //     //it is difficult to compare objects. So instead of comparing objects we convert the objects to strings 
    //     //to compare with JSON.stringify, and then use parse to get coords if needed
    //     if(!obstacles.includes(JSON.stringify(this.Hex(c,r,s)))){
    //         obstacles = [].concat(obstacles, JSON.stringify(this.Hex(c,r,s)))
    //         //obstacles.push(this.state.currentHex);
    //     }
    //     else{
    //         obstacles.map((l,i)=> {
    //             if(l == JSON.stringify(this.Hex(c,r,s))){
    //                 //slicing before and after item??
    //                 obstacles = obstacles.slice(0,i).concat(obstacles.slice(i+1));
    //             }
    //         })
    //     }
    //     this.setState({
    //         obstacles: obstacles
    //     })
    // }

    breadthFirstSearch(playerPosition){
        //handles breadth first search of neighboring hexes
        var frontier = [playerPosition];
        var camefrom = {};
        camefrom[JSON.stringify(playerPosition)] = JSON.stringify(playerPosition);
        while(frontier.length != 0){
            var current = frontier.shift();
            let arr = this.getNeighbors(current);
            arr.map((l)=> {
                if(!camefrom.hasOwnProperty(JSON.stringify(l)) && !this.state.hexPathMap.includes(JSON.stringify(l))){
                    frontier.push(l);
                    camefrom[JSON.stringify(l)] = JSON.stringify(current);
                }
            })
        }
        camefrom = Object.assign({}, camefrom);
        this.setState({
            camefrom: camefrom
        })
    }

    render(){
        return (
            <div className="App">
                <canvas ref={canvasHex => this.canvasHex = canvasHex} ></canvas>
                <canvas ref={canvasCoordinates => this.canvasCoordinates = canvasCoordinates}></canvas>
                <canvas ref={canvasView => this.canvasView = canvasView}></canvas>
                <canvas ref={canvasInteraction => this.canvasInteraction = canvasInteraction} onMouseMove = {this.handleMouseMove} onClick = {this.handleClick} ></canvas>
                <button className="expandButton" onClick={this.handleExpandClick}>Expand</button>
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