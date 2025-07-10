
import path from 'node:path';
import fs from "node:fs";

function _datadir_(name, opt) {
	let dir;
	if (process.platform === 'linux') {
		if (!opt || ["share", "local"].includes(opt.toLowerCase())) {
			dir = path.join(process.env.HOME, "/.local/share/", name);
		} else if (opt && opt === "config") {
			dir = path.join(process.env.HOME, "/.config/", name);
		} else if (opt && opt === "home") {
			dir = path.join(process.env.HOME, `.${name}`);
		}
	
	// Windows | local: "AppData\Local\<name>"
	} else if (opt === "local" && process.env.LOCALAPPDATA) {
		dir = path.join(process.env.LOCALAPPDATA, name); 	
	// Windows | home: "My Documents/<name>"
	} else if (opt === "home" && process.env.USERPROFILE) {
		dir = path.join(process.env.USERPROFILE, "My Documents", name); 	
	// Windows | share(default): "AppData\Roaming\<name>"
	} else if (process.env.APPDATA && (!opt || (opt !== "local" && opt !== "home"))) {
		dir = path.join(process.env.APPDATA, name);

	// Mac Path
	} else if (process.platform == 'darwin') {
		dir = path.join(process.env.HOME, '/Library/Preferences', name);

	// Catch All for Others
	} else {
		dir = path.join(process.env.HOME, `.${name}`);
	}

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir, { recursive: true });
	}

	return dir;
}


export default {
	datadir(name) {
		return _datadir_(name)
	},
	
	local(name) {
		return _datadir_(name, "local")
	},

	share(name) {
		return _datadir_(name, "share")
	},

	home(name) {
		return _datadir_(name, "home")
	}
}