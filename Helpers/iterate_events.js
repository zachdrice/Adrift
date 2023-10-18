module.exports = (dirName, callback) => {
  const dir = FS.readdirSync(dirName);
	dir.forEach(newDir => {
    if(newDir.indexOf('.') > -1) return;
		const files = FS.readdirSync(PATH.join(dirName, newDir));
		files.forEach(file => {
			const event = file.split('.')[0];
			callback(event, newDir);
		});
  });
};