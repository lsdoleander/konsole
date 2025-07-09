
export class StopWatch {
    constructor() {
        this.start = new Date().getTime();
    }

    time() {
        const _n = new Date();
        return _n.getTime() - this.start;
    }

    display(runs) {
        const millis = this.time();
        const f = Math.floor,
        seconds = f(millis/1000),
        minutes = seconds/60, fmins = f(minutes),
        rsex = (seconds - (fmins*60)), 
        dsecs = `${rsex<10?"0":""}${rsex}`
        
        let out = { minutes: fmins, 
        seconds: dsecs 
        };
        if (runs) out.permin = (runs/minutes).toFixed(2);
        return out;
    }
}
