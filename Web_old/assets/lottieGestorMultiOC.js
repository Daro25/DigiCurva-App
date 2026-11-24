    function LottieOCplay(id) {
        const dottie = document.getElementById('dottieOrder'+id);
        const animation = dottie.dotLottie;
        animation.setSegment(0,150);
        animation.play();
    }
    function LottieOCplayStp1(id) {
        const dottie = document.getElementById('dottieOrder'+id);
        const animation = dottie.dotLottie;
        document.getElementById('salvadorLottieOrder'+id).style.display = 'none';
        animation.setSegment(0,38);
        animation.play();
    }
    function LottieOCreload(id) {
        const dottie = document.getElementById('dottieOrder'+id);
        const animation = dottie.dotLottie;
        animation.play(0);
        animation.stop();
    }
    function LottieOCstep1(id) {
        const dottie = document.getElementById('dottieOrder'+id);
        const animation = dottie.dotLottie;
        animation.setFrame(38);
    }