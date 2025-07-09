
import path from 'node:path';
import fs from "node:fs";

export default function (name, opt) {
	let dir;
	if (process.platform === 'linux') {
		if (!opt || ["share", "local"].includes(opt.toLowerCase())) {
			dir = path.join(process.env.HOME, "/.local/share/", name);
		} else if (opt && opt === "config") {
			dir = path.join(process.env.HOME, "/.config/", name);
		} else if (opt && opt === "home") {
			dir = path.join(process.env.HOME, `.${name}`);
		}
	} else if (opt === "local" && process.env.LOCALAPPDATA) {
		dir = path.join(process.env.LOCALAPPDATA, name); 
	} else if (process.env.APPDATA && (!opt || opt !== "local")) {
		dir = path.join(process.env.APPDATA, name); 
	} else if (process.platform == 'darwin') {
		dir = path.join(process.env.HOME, '/Library/Preferences', name);
	} else {
		dir = path.join(process.env.HOME, `.${name}`);
	}

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir, { recursive: true });
	}

	return dir;
}