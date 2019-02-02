'use babel';

function dheader() {}

dheader.prototype.init = function(settings) {
    console.log('hello world');
}

dheader.prototype.destroy = function() {
    console.log('good bye world');
}


module.exports = function() {
    return new dheader();
}