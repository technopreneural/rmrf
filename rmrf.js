var fs 		= require('fs'),
	path	= require('path');

function rmrf(pathname, callback) {
	fs.rmdir(pathname, function(err) {
		if (err) {
			switch (err.code) {
				// 
				case 'ENOTDIR':
					fs.unlink(pathname, callback);
					break;
				case 'ENOTEMPTY':
					// The directory <pathname> is not empty.
					// Delete its content first.
					fs.readdir(pathname, function(err, files) {
						if (err) {
							callback(err);
						} else {
							var pobj = path.parse(pathname);
							// Promise chaining helps avoid "out of
							// memory" errors in deeply nested directories
							files.reduce(function(prev, cur, index) {
								return prev.then(function() {
									return new Promise(function(resolve) {
										rmrf((pobj.dir ? [pobj.dir] : [])
											.concat([pobj.base, cur]).join('/'),
											function() {
												if (err) {
													reject(err);
												} else {
													resolve();
												}
											});								
									});
								});
							}, Promise.resolve()).then(function() {
								rmrf(pathname, callback);
							});
						}
					});
					break;
				default:
					callback(err);
			}
		} else {
			// The empty directory <pathname> was successfully deleted.
			callback();
		}
	});
}

module.exports = rmrf;