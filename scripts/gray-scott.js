(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.GrayScott = factory();
    }
}(this, function () {
    /**
     * Nice F,K values:
     * (0.055, 0.062)
     * (0.035, 0.06)
     */
    var gs = function (W, H, F, K) {
        var diffU = 0.16;
        var diffV = 0.08;
        // diffU = 0.05;
        // diffV = 0.025;

        var U = new Float64Array(W*H); //double[W][H]
        var V = new Float64Array(W*H); //double[W][H]
       
        var dU = new Float64Array(W*H); //double[W][H]
        var dV = new Float64Array(W*H); //double[W][H]

        var uRange = {'min' : 999999, 'max' : 0};
        var vRange = {'min' : 999999, 'max' : 0};
       
        var offsetX = []; //int[H][2]
        var offsetY = []; //int[W][2]

        _initArrays();
        _initOffsets();

        function _initArrays () {
            var x, y;
            for (y = 0; y < H; y++) {
                for (x = 0; x < W; x++) {
                  var idx = y*W + x;
                  U[idx] = 1.0;
                  // V[i][j] = 0.0;
                }
            }
            return;

            if (random) {
                for (var i = 0; i < 99 ; i++){
                  var x = Math.floor(Math.random()*W);
                  var y = Math.floor(Math.random()*H);
                  var idx = y*W + x;
                  U[idx] = 0.0;
                  V[idx] = 1.25;
                }
                // for (y = Math.floor(H/5); y < Math.ceil(4*H/5); y++) {
                //   for (x = Math.floor(W/5); x < Math.ceil(4*W/5); x++) {
                //     var idx = y*W + x;
                //     U[idx] = 0.5*(Math.random()*2);
                //     V[idx] = 0.25*(Math.random()*2);
                //   }
                // }
            } else {
                for (y = H/3; y < 2*H/3; y++) {
                  for (x = W/3; x < 2*W/3; x++) {
                    var idx = y*W + x;
                    U[idx] = 0.5;
                    V[idx] = 0.25;
                  }
                }
            }
        };

        function seedUniform(count) {
            for (var i = 0; i < count ; i++){
                var x = Math.floor(Math.random()*W);
                var y = Math.floor(Math.random()*H);
                var idx = y*W + x;
                U[idx] = 0.0;
                V[idx] = 1.25;
            }
        };

        function seedCenter() {
            for (y = Math.floor(H/5); y < Math.ceil(4*H/5); y++) {
                for (x = Math.floor(W/5); x < Math.ceil(4*W/5); x++) {
                    var idx = y*W + x;
                    U[idx] = 0.5*(Math.random()*2);
                    V[idx] = 0.25*(Math.random()*2);
                }
            }
        };

        function setPoint(x, y, u, v) {
            var idx = y*W + x;
            U[idx] = u;
            V[idx] = v;
        };

        function _initOffsets() {
            //Set up offsets
            var i;

            //horizontal
            for (i = 0; i < W; i++) {
                offsetX[i] = [i-1, i+1];
            }
            offsetX[0][0] = W-1;
            offsetX[0][1] = 1;
            offsetX[W-1][0] = W-2;
            offsetX[W-1][1] = 0;

            //vartical
            for (i = 0; i < H; i++) {
                offsetY[i] = [i-1, i+1];
            }
            offsetY[0][0] = H-1;
            offsetY[0][1] = 1;
            offsetY[H-1][0] = H-2;
            offsetY[H-1][1] = 0;
        };

        function timestep() {
            var x, y;
            for (y = 0; y < H; y++) {
                for (x = 0; x < W; x++) {
                  var idx = y*W + x;
                  var u = U[idx];
                  var v = V[idx];
                   
                  var lf = offsetX[x][0];
                  var rt = offsetX[x][1];
                  var up = offsetY[y][0];
                  var dn = offsetY[y][1];
                   
                  var uvv = u*v*v;    
                
                  var lapU = (U[y*W+lf] + U[y*W+rt] + U[up*W+x] + U[dn*W+x] - 4*u);
                  var lapV = (V[y*W+lf] + V[y*W+rt] + V[up*W+x] + V[dn*W+x] - 4*v);
                  // var lapU = (U[y*W+lf] + U[y*W+rt] + U[up*W+x] + U[dn*W+x])*4 + 
                  //            (U[up*W+lf] + U[up*W+rt] + U[dn*W+lf] + U[dn*W+rt]) - u*20;
                  // var lapV = (V[y*W+lf] + V[y*W+rt] + V[up*W+x] + V[dn*W+x])*4 + 
                  //            (V[up*W+lf] + V[up*W+rt] + V[dn*W+lf] + V[dn*W+rt]) - v*20;
                   
                  dU[idx] = diffU*lapU  - uvv + F*(1 - u);
                  dV[idx] = diffV*lapV + uvv - (K+F)*v;
                }
            };
               
            //update and calculate ranges
            uRange.max = 0; 
            uRange.min = 99999; 
            vRange.max = 0; 
            vRange.min = 99999; 
            for (y= 0; y < H; y++) {
                for (x = 0; x < W; x++){
                  var idx = y*W + x;
                  U[idx] += dU[idx];
                  V[idx] += dV[idx];
                  if (U[idx] > uRange.max){
                    uRange.max = U[idx];
                  }
                  if (U[idx] < uRange.min){
                    uRange.min = U[idx];
                  }
                  if (V[idx] > vRange.max){
                    vRange.max = V[idx];
                  }
                  if (V[idx] < vRange.min){
                    vRange.min = V[idx];
                  }
                }
            }
        };

        function setParams(newF, newK){
            F = newF;
            K = newK;
        };

        return {
            'U' : U,
            'V' : V,
            'uRange' : uRange,
            'vRange' : vRange,

            'seedUniform' : seedUniform,
            'seedCenter' : seedCenter,
            'setPoint' : setPoint,
            'timestep' : timestep,
            'setParams' : setParams
        };
    };
    return gs;
}));