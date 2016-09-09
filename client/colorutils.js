define(function(){

	function r (c) {
		return (c & 0xff0000) >> 16;
	}

	function g (c) {
		return (c & 0xff00) >> 8;
	}

	function b (c) {
		return (c & 0xff);
	}

    return {
    	toRGB: function (c) {
    		return 'rgb('+r(c)+','+g(c)+','+b(c)+')'
    	}
    }
});