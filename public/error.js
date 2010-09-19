if (typeof error_conf == 'undefined') {
    error_conf = {
        filter: null
    };
}

window.onerror = function(m, f, l) {
    var r = new RegExp(error_conf.filter, 'i');
    if (f.match(r) == null) {
        return false;
    }
    var i = new Image();
    i.src = "/track?m="+escape(m)+"&f="+escape(f)+"&l="+escape(l)+"&u="+escape(location.href);
    return true;
};
