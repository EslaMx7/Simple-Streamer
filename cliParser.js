var cliParser = function (argv) {

	var result = {
		fileName: "",
		subtitle: "",
		port: 7000
	};

	var args = argv.slice(2);

	for (var i = 0; i < args.length; i++) {
		var opt = args[i];

		switch (i) {
			case 0: // Video File Name
				if (opt.toLowerCase().lastIndexOf(".mp4") == opt.length - 4) // Support .mp4 extension only.
					result.fileName = opt;
				else {
					console.log("(.mp4) file extension only supported.");
					process.exit(1); // Terminate Program with Error Signal.
				}
				break;
			case 1: // Subtitle File Name (Optional)
				if (opt.toLowerCase().lastIndexOf(".vtt") == opt.length - 4) // Support .vtt extension.
					result.subtitle = opt;
				else if (opt.toLowerCase().lastIndexOf(".srt") == opt.length - 4) // Support .srt extension.
					result.subtitle = opt;
				else
					console.log("(.vtt) subtitle extension only supported.");
				break;
			case 2: // Server Listening Port (Optional)
				result.port = parseInt(opt);
				break;
			default:
				break;
		}

	}

	return result;
};

module.exports = cliParser;