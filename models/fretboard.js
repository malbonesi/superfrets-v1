module.exports = new Class({

   //Binds: ['getMatrix', 'getFretX', 'loadInlays'],
        
    inlays: [3,5,7,9,12,15,17,19,21],
    nutOffset: 15,
    colors: {
		nut: "#1E1E1E",
		fret: "#3E3E3E",
		string: "#515151",
		inlay: "#CDCDCD"//"#ECECEC"
	},
    
    matrix: [],
    fretValues: [],
    yValues: [],
    
    initialize: function(frets, strings, tuning){
				
		this.frets = frets;
		this.strings = strings;
		this.tuning = tuning;
	
		this.xScale = this.getFretX(this.frets) + 5 ;
		this.yScale = Math.floor(1200 * 0.071);
			
		this.stringOffset = Math.floor(this.yScale / (this.strings + 1)); //Could also do (yScale x .12) / 2?
			
		this.loadMatrix();
		this.loadFretVals();
		this.loadStringVals();
    },

    //noteId 12 on string index 4 is being pushed on for fret 23 for standard tuning (noteId 1 for that string)
    loadMatrix: function(){
		var matrix = [];
                                    
        //Hardcoding 12 as there will always only be 12 notes
        for (var i = 1; i <= 12; i++){
        
        var notes = [];
        //need to push on a strings/tuning length array of xValues (so another array)
            this.tuning.forEach(function(t){
                var values = [];
                var fret = (12 - t) + i;
                
                if (fret <= this.frets) { values.push(this.getNoteX(fret)); }
		
                //Need to figure out how to limit this based on the amount of frets on the fretboard
                if (fret > 12){
                    values.push(this.getNoteX(fret - 12));
                }
                else if (fret <= 12){ //99% of the time there will only be an issue with notes going over the 22 fret number
                    fret += 12;
                    if (fret <= this.frets) {
                        values.push(this.getNoteX(fret));
                    }   
                }    
                notes.push(values);                         
            }, this);
            
        matrix.push(notes);
        }
        
    this.matrix = matrix;
    },

    //Sets the y values for the strings
    loadStringVals: function(){
    
        var values = [];
        var halfStrOffset = this.stringOffset / 2;

        for (var stringNum = 0; stringNum < this.strings; stringNum++) { 
                                    
            var y;
            if (stringNum === 0) {
			
                y = halfStrOffset;
            }
            else {
                y = halfStrOffset + (stringNum * ((this.yScale - this.stringOffset) / (this.strings - 1 )));
            }
       
            values.push(Math.floor(y));
        }
        this.yValues = values;
    },
    //loads all of the fret wire x values for drawing
    loadFretVals: function(){
        var values = [];
        for (var fretNum = 1; fretNum <= this.frets; fretNum++) {
                                        
            values.push(this.getFretX(fretNum));
            
        }
        this.fretValues = values;
    },
    //The noteX is between fret wires so we need this    
    getNoteX: function(fret){
       return Math.floor((this.getFretX(fret-1) + this.getFretX(fret)) / 2);
    },
    
    //The common scenario is to include the nutoffset
    //So this should return where the fret wire is in relation to nut... just like a guitar
    getFretX: function(fret){
        return Math.floor(this.nutOffset + (1200 - (1200 / Math.pow(2, (fret / 12)))));
    }
});