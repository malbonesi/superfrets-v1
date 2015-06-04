module.exports = new Class({
    
    Implements: Events,
    
    initialize: function(name){
        this.name = name;
        this.chords = [];
    },
    
    add: function(chord){
        this.chords.push(chord);
        this.fireEvent('change');
    },
    
    remove: function(index){
    
        this.chords.splice(index, 1);
        this.fireEvent('change');
    },
    
    clear: function(){
        this.chords.empty();
        this.fireEvent('change');
    },
    
    select: function(index){
        
        this.chords.forEach(function(e,i){
            if (i === index){
                e.selected = true;
            }
            else{
                e.selected = false;
            }
        });
        
        this.fireEvent('change');
    }
});