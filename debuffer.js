

import fs from "node:fs"
import os from "node:os"
import path from 'node:path'

export function debuffer (logsdir, opts={ console:true, exceptions:true, rejections:true, segfault:false }) {

	let pathname = path.resolve(logsdir);
	if (!fs.existsSync(pathname)) fs.mkdirSync(pathname, { recursive: true });

	function _lf(l="debug") { 
		const today = new Date();
		function zf(z) { const y=`${z}`;return y.length > 1 ? y : "0"+y; }
		return path.join(pathname, `${l}_${zf(today.getMonth()+1) + zf(today.getDate()) + today.getFullYear()}.log`);
	}

    let verbose = (function isverbose() {                        
        for (const argv of process.argv){ if (argv==="--verbose") return true; } return false;
    })();

	function _lo(path, msg, logger) {
		for (let idx in msg) {
			if (typeof msg[idx] === "object") {
				if (msg[idx] instanceof Error) {
					if (verbose || logger === "trace") {
						msg[idx] = msg[idx].message + "\n" + msg[idx].stack;
					} else {
						msg[idx] = msg[idx].message
					}
				} else {
					msg[idx] = JSON.stringify(msg[idx], null, 2);
				}
			}
		}
		fs.appendFileSync(path, `${msg.join(" ")}\n`, "utf-8");
	}

	const API = {
		logger(name){
			let _p = _lf(name);
			return {
				log(...msg){
					_lo(_p, msg,"log");
				},
				debug(...msg){
					if (verbose) _lo(_p, msg);
				},
				trace(...e){
					_lo(_p, e, "trace");
				}
			}
		}
	}

	if (opts.segfault) {
		eval(atob("Y29uc3QgU2VnZmF1bHRIYW5kbGVyID0gYXdhaXQgaW1wb3J0KCJzZWdmYXVsdC1oYW5kbGVyIik7DQpTZWdmYXVsdEhhbmRsZXIucmVnaXN0ZXJIYW5kbGVyKHBhdGguam9pbihsb2dzZGlyLCAiY3Jhc2gubG9nIikpOw=="));
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

        function solecons(object,method,label){
            let syscall = console[method];
            console[method] = function monkeylogger (...args) {
                if (method === "trace") intercepts.trace("[TRACE]", ...args);
                else intercepts.log(`[${(label||method).toUpperCase()}]`, ...args);
            }
            return solecons;
        }

        solecons(console,"log","info")(console,"debug")(console,"info")(console,"warn")(console,"error")(console,"trace");
    	solecons(process.stdout,"write","stdout")(process.stderr,"write","stderr");
	}

	if (opts.exceptions || opts.rejections) {
		const errors = API.logger("fatal");

		if (opts.rejections) {
			process.on('unhandledRejection', (reason, p) => {
	            errors.log('Unhandled Rejection:');
	            errors.trace(reason);
	            errors.log("  \\\\---> at Promise:");
	            errors.trace(p);
	        });
	    }

	    if (opts.exceptions) {
        	process.on('uncaughtException', err => {
            	errors.log('Uncaught Exception');
            	errors.trace(err);
        	});
        }
	}
	
	return API
}
