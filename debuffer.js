
import fs from "node:fs"
import os from "node:os"
import path from 'node:path'

export default function debuffer (logsdir, opts={ console=true, exceptions=true, rejections=true, segfault=true }) {

	let pathname = path.resolve(logsdir);
	if (!fs.existsSync(pathname)) fs.mkdirSync(pathname, { recursive: true });

	if (segfault) {
		const SegfaultHandler = (import("segfault-handler", async _module_ => {
			return _module_.default;
		}))();
		SegfaultHandler.registerHandler(path.join(logsdir, "crash.log"));
	}

	if (opts.console) {
		let output = console.log;

		if (console.$monkeypatched === true) {
			output = console.$internal;
		} else {
			output = console.$internal = console.log;
            console.$monkeypatched = true;
		}

		const intercepts = API.logger("console");

        function solecons(object,method){
            let syscall = console[method];
            console[method] = function monkeylogger (...args) {
                if (method === "trace") intercepts.trace("[TRACE]", ...args);
                else intercepts.log(`[${method.toUpperCase()}`, ...args);
            }
            return solecons;
        }

        solecons(console,"log")(console,"debug")(console,"info")(console,"warn")(console,"error")(console,"trace");
    	solecons(process.stdout,"write")(process.stderr,"write");
	}

	if (opts.exceptions || opts.rejections) {
		const errors = API.logger("fatal");

		if (opts.rejections) {
			process.on('unhandledRejection', (reason, p) => {
	            errors.log('Unhandled Rejection:');
	            errors.trace(reason);
	            errors.log("  \\\\---> at Promise:");
	            errors.trace(p);
	        }
	    }

	    if (opts.exceptions) {
        	process.on('uncaughtException', err => {
            	errors.log('Uncaught Exception');
            	errors.trace(err);
        	});
        }
	}

	function _lf(l="debug") { 
		const today = new Date();
		function zf(z) { const y=`${z}`;return y.length > 1 ? y : "0"+y; }
		return path.join(pathname, `${l}_${zf(today.getMonth()+1) + zf(today.getDate()) + today.getFullYear()}.log`);
	}

	let def = _lf();

	function _lo(path, msg) {
		for (let idx in msg) {
			if (typeof msg[idx] === "object") msg[idx] = JSON.stringify(thingy, null, 2);
		}
		fs.appendFileSync(path, `${msg.join(" ")}\n`, "utf-8");
	}

	let __k;

	const API = {
		console(){
			return output;
		},
		logger(name){
			let _p = _lf(name);
			return {
				log(...msg){
					_lo(_p, msg);
				}
			}
		},
		log(...msg){
			_lo(def, msg);
		}
	}
	
	return API
}
