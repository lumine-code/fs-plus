var fs, path, temp;

path = require('path');

temp = require('./helpers/temp');

fs = require('../lib/fs-plus');

temp.track();

describe("fs", function() {
  var fixturesDir, linkToSampleFile, sampleFile;
  fixturesDir = path.join(__dirname, 'fixtures');
  sampleFile = path.join(fixturesDir, 'sample.js');
  linkToSampleFile = path.join(fixturesDir, 'link-to-sample.js');
  try {
    fs.unlinkSync(linkToSampleFile);
  } catch (error1) {}
  fs.symlinkSync(sampleFile, linkToSampleFile, 'junction');
  afterAll(function() {
    try {
      return fs.unlinkSync(linkToSampleFile);
    } catch (error1) {}
  });
  describe(".isFileSync(path)", function() {
    it("returns true with a file path", function() {
      return expect(fs.isFileSync(path.join(fixturesDir, 'sample.js'))).toBe(true);
    });
    it("returns false with a directory path", function() {
      return expect(fs.isFileSync(fixturesDir)).toBe(false);
    });
    return it("returns false with a non-existent path", function() {
      expect(fs.isFileSync(path.join(fixturesDir, 'non-existent'))).toBe(false);
      return expect(fs.isFileSync(null)).toBe(false);
    });
  });
  describe(".isSymbolicLinkSync(path)", function() {
    it("returns true with a symbolic link path", function() {
      return expect(fs.isSymbolicLinkSync(linkToSampleFile)).toBe(true);
    });
    it("returns false with a file path", function() {
      return expect(fs.isSymbolicLinkSync(sampleFile)).toBe(false);
    });
    return it("returns false with a non-existent path", function() {
      expect(fs.isSymbolicLinkSync(path.join(fixturesDir, 'non-existent'))).toBe(false);
      expect(fs.isSymbolicLinkSync('')).toBe(false);
      return expect(fs.isSymbolicLinkSync(null)).toBe(false);
    });
  });
  describe(".isSymbolicLink(path, callback)", function() {
    it("calls back with true for a symbolic link path", function() {
      var callback;
      callback = jasmine.createSpy('isSymbolicLink');
      fs.isSymbolicLink(linkToSampleFile, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        return expect(callback.calls.mostRecent().args[0]).toBe(true);
      });
    });
    it("calls back with false for a file path", function() {
      var callback;
      callback = jasmine.createSpy('isSymbolicLink');
      fs.isSymbolicLink(sampleFile, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        return expect(callback.calls.mostRecent().args[0]).toBe(false);
      });
    });
    return it("calls back with false for a non-existent path", function() {
      var callback;
      callback = jasmine.createSpy('isSymbolicLink');
      fs.isSymbolicLink(path.join(fixturesDir, 'non-existent'), callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      runs(function() {
        expect(callback.calls.mostRecent().args[0]).toBe(false);
        callback.calls.reset();
        return fs.isSymbolicLink('', callback);
      });
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      runs(function() {
        expect(callback.calls.mostRecent().args[0]).toBe(false);
        callback.calls.reset();
        return fs.isSymbolicLink(null, callback);
      });
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        return expect(callback.calls.mostRecent().args[0]).toBe(false);
      });
    });
  });
  describe(".existsSync(path)", function() {
    it("returns true when the path exists", function() {
      return expect(fs.existsSync(fixturesDir)).toBe(true);
    });
    return it("returns false when the path doesn't exist", function() {
      expect(fs.existsSync(path.join(fixturesDir, "-nope-does-not-exist"))).toBe(false);
      expect(fs.existsSync("")).toBe(false);
      return expect(fs.existsSync(null)).toBe(false);
    });
  });
  describe(".remove(pathToRemove, callback)", function() {
    var tempDir;
    tempDir = null;
    beforeEach(function() {
      return tempDir = temp.mkdirSync('fs-plus-');
    });
    it("removes an existing file", function() {
      var done, filePath;
      filePath = path.join(tempDir, 'existing-file');
      fs.writeFileSync(filePath, '');
      done = false;
      fs.remove(filePath, function() {
        return done = true;
      });
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(fs.existsSync(filePath)).toBe(false);
      });
    });
    it("does nothing for a non-existent file", function() {
      var done, filePath;
      filePath = path.join(tempDir, 'non-existent-file');
      done = false;
      fs.remove(filePath, function() {
        return done = true;
      });
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(fs.existsSync(filePath)).toBe(false);
      });
    });
    return it("removes a non-empty directory", function() {
      var directoryPath, done;
      directoryPath = path.join(tempDir, 'subdir');
      fs.makeTreeSync(path.join(directoryPath, 'subdir'));
      done = false;
      fs.remove(directoryPath, function() {
        return done = true;
      });
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(fs.existsSync(directoryPath)).toBe(false);
      });
    });
  });
  describe(".makeTreeSync(path)", function() {
    var aPath;
    aPath = path.join(temp.dir, 'a');
    beforeEach(function() {
      if (fs.existsSync(aPath)) {
        return fs.removeSync(aPath);
      }
    });
    it("creates all directories in path including any missing parent directories", function() {
      var abcPath;
      abcPath = path.join(aPath, 'b', 'c');
      fs.makeTreeSync(abcPath);
      return expect(fs.isDirectorySync(abcPath)).toBeTruthy();
    });
    return it("throws an error when the provided path is a file", function() {
      var error, filePath, makeTreeError, tempDir;
      tempDir = temp.mkdirSync('fs-plus-');
      filePath = path.join(tempDir, 'file.txt');
      fs.writeFileSync(filePath, '');
      expect(fs.isFileSync(filePath)).toBe(true);
      makeTreeError = null;
      try {
        fs.makeTreeSync(filePath);
      } catch (error1) {
        error = error1;
        makeTreeError = error;
      }
      expect(makeTreeError.code).toBe('EEXIST');
      return expect(makeTreeError.path).toBe(filePath);
    });
  });
  describe(".makeTree(path)", function() {
    var aPath;
    aPath = path.join(temp.dir, 'a');
    beforeEach(function() {
      if (fs.existsSync(aPath)) {
        return fs.removeSync(aPath);
      }
    });
    it("creates all directories in path including any missing parent directories", function() {
      var abcPath, callback;
      callback = jasmine.createSpy('callback');
      abcPath = path.join(aPath, 'b', 'c');
      fs.makeTree(abcPath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      runs(function() {
        expect(callback.calls.allArgs()[0][0]).toBeNull();
        expect(fs.isDirectorySync(abcPath)).toBeTruthy();
        return fs.makeTree(abcPath, callback);
      });
      waitsFor(function() {
        return callback.calls.count() === 2;
      });
      return runs(function() {
        expect(callback.calls.allArgs()[1][0]).toBeUndefined();
        return expect(fs.isDirectorySync(abcPath)).toBeTruthy();
      });
    });
    return it("calls back with an error when the provided path is a file", function() {
      var callback, filePath, tempDir;
      callback = jasmine.createSpy('callback');
      tempDir = temp.mkdirSync('fs-plus-');
      filePath = path.join(tempDir, 'file.txt');
      fs.writeFileSync(filePath, '');
      expect(fs.isFileSync(filePath)).toBe(true);
      fs.makeTree(filePath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        expect(callback.calls.allArgs()[0][0]).toBeTruthy();
        expect(callback.calls.allArgs()[0][1]).toBeUndefined();
        expect(callback.calls.allArgs()[0][0].code).toBe('EEXIST');
        return expect(callback.calls.allArgs()[0][0].path).toBe(filePath);
      });
    });
  });
  describe(".traverseTreeSync(path, onFile, onDirectory)", function() {
    it("calls fn for every path in the tree at the given path", function() {
      var onPath, paths;
      paths = [];
      onPath = function(childPath) {
        paths.push(childPath);
        return true;
      };
      expect(fs.traverseTreeSync(fixturesDir, onPath, onPath)).toBeUndefined();
      return expect(paths).toEqual(fs.listTreeSync(fixturesDir));
    });
    it("does not recurse into a directory if it is pruned", function() {
      var filePath, j, len, onPath, paths, results;
      paths = [];
      onPath = function(childPath) {
        if (childPath.match(/\/dir$/)) {
          return false;
        } else {
          paths.push(childPath);
          return true;
        }
      };
      fs.traverseTreeSync(fixturesDir, onPath, onPath);
      expect(paths.length).toBeGreaterThan(0);
      results = [];
      for (j = 0, len = paths.length; j < len; j++) {
        filePath = paths[j];
        results.push(expect(filePath).not.toMatch(/\/dir\//));
      }
      return results;
    });
    it("returns entries if path is a symlink", function() {
      var onPath, onSymlinkPath, paths, regularPath, symlinkPath, symlinkPaths;
      symlinkPath = path.join(fixturesDir, 'symlink-to-dir');
      symlinkPaths = [];
      onSymlinkPath = function(path) {
        return symlinkPaths.push(path.substring(symlinkPath.length + 1));
      };
      regularPath = path.join(fixturesDir, 'dir');
      paths = [];
      onPath = function(path) {
        return paths.push(path.substring(regularPath.length + 1));
      };
      fs.traverseTreeSync(symlinkPath, onSymlinkPath, onSymlinkPath);
      fs.traverseTreeSync(regularPath, onPath, onPath);
      return expect(symlinkPaths).toEqual(paths);
    });
    return it("ignores missing symlinks", function() {
      var directory, onPath, paths;
      if (process.platform !== 'win32') { // Dir symlinks on Windows require admin
        directory = temp.mkdirSync('symlink-in-here');
        paths = [];
        onPath = function(childPath) {
          return paths.push(childPath);
        };
        fs.symlinkSync(path.join(directory, 'source'), path.join(directory, 'destination'));
        fs.traverseTreeSync(directory, onPath);
        return expect(paths.length).toBe(0);
      }
    });
  });
  describe(".traverseTree(path, onFile, onDirectory, onDone)", function() {
    it("calls fn for every path in the tree at the given path", function() {
      var done, onDone, onPath, paths;
      paths = [];
      onPath = function(childPath) {
        paths.push(childPath);
        return true;
      };
      done = false;
      onDone = function() {
        return done = true;
      };
      fs.traverseTree(fixturesDir, onPath, onPath, onDone);
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(paths).toEqual(fs.listTreeSync(fixturesDir));
      });
    });
    it("does not recurse into a directory if it is pruned", function() {
      var done, onDone, onPath, paths;
      paths = [];
      onPath = function(childPath) {
        if (childPath.match(/\/dir$/)) {
          return false;
        } else {
          paths.push(childPath);
          return true;
        }
      };
      done = false;
      onDone = function() {
        return done = true;
      };
      fs.traverseTree(fixturesDir, onPath, onPath, onDone);
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        var filePath, j, len, results;
        expect(paths.length).toBeGreaterThan(0);
        results = [];
        for (j = 0, len = paths.length; j < len; j++) {
          filePath = paths[j];
          results.push(expect(filePath).not.toMatch(/\/dir\//));
        }
        return results;
      });
    });
    it("returns entries if path is a symlink", function() {
      var onPath, onRegularPathDone, onSymlinkPath, onSymlinkPathDone, paths, regularDone, regularPath, symlinkDone, symlinkPath, symlinkPaths;
      symlinkPath = path.join(fixturesDir, 'symlink-to-dir');
      symlinkPaths = [];
      onSymlinkPath = function(path) {
        return symlinkPaths.push(path.substring(symlinkPath.length + 1));
      };
      regularPath = path.join(fixturesDir, 'dir');
      paths = [];
      onPath = function(path) {
        return paths.push(path.substring(regularPath.length + 1));
      };
      symlinkDone = false;
      onSymlinkPathDone = function() {
        return symlinkDone = true;
      };
      regularDone = false;
      onRegularPathDone = function() {
        return regularDone = true;
      };
      fs.traverseTree(symlinkPath, onSymlinkPath, onSymlinkPath, onSymlinkPathDone);
      fs.traverseTree(regularPath, onPath, onPath, onRegularPathDone);
      waitsFor(function() {
        return symlinkDone && regularDone;
      });
      return runs(function() {
        return expect(symlinkPaths).toEqual(paths);
      });
    });
    return it("ignores missing symlinks", function() {
      var directory, done, onDone, onPath, paths;
      if (process.platform === 'win32') {
        return;
      }
      directory = temp.mkdirSync('symlink-in-here');
      paths = [];
      onPath = function(childPath) {
        return paths.push(childPath);
      };
      fs.symlinkSync(path.join(directory, 'source'), path.join(directory, 'destination'));
      done = false;
      onDone = function() {
        return done = true;
      };
      fs.traverseTree(directory, onPath, onPath, onDone);
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(paths.length).toBe(0);
      });
    });
  });
  describe(".traverseTree(path, onFile, onDirectory, onDone)", function() {
    it("calls fn for every path in the tree at the given path", function() {
      var done, onDone, onPath, paths;
      paths = [];
      onPath = function(childPath) {
        paths.push(childPath);
        return true;
      };
      done = false;
      onDone = function() {
        return done = true;
      };
      fs.traverseTree(fixturesDir, onPath, onPath, onDone);
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(paths).toEqual(fs.listTreeSync(fixturesDir));
      });
    });
    it("does not recurse into a directory if it is pruned", function() {
      var done, onDone, onPath, paths;
      paths = [];
      onPath = function(childPath) {
        if (childPath.match(/\/dir$/)) {
          return false;
        } else {
          paths.push(childPath);
          return true;
        }
      };
      done = false;
      onDone = function() {
        return done = true;
      };
      fs.traverseTree(fixturesDir, onPath, onPath, onDone);
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        var filePath, j, len, results;
        expect(paths.length).toBeGreaterThan(0);
        results = [];
        for (j = 0, len = paths.length; j < len; j++) {
          filePath = paths[j];
          results.push(expect(filePath).not.toMatch(/\/dir\//));
        }
        return results;
      });
    });
    it("returns entries if path is a symlink", function() {
      var onPath, onRegularPathDone, onSymlinkPath, onSymlinkPathDone, paths, regularDone, regularPath, symlinkDone, symlinkPath, symlinkPaths;
      symlinkPath = path.join(fixturesDir, 'symlink-to-dir');
      symlinkPaths = [];
      onSymlinkPath = function(path) {
        return symlinkPaths.push(path.substring(symlinkPath.length + 1));
      };
      regularPath = path.join(fixturesDir, 'dir');
      paths = [];
      onPath = function(path) {
        return paths.push(path.substring(regularPath.length + 1));
      };
      symlinkDone = false;
      onSymlinkPathDone = function() {
        return symlinkDone = true;
      };
      regularDone = false;
      onRegularPathDone = function() {
        return regularDone = true;
      };
      fs.traverseTree(symlinkPath, onSymlinkPath, onSymlinkPath, onSymlinkPathDone);
      fs.traverseTree(regularPath, onPath, onPath, onRegularPathDone);
      waitsFor(function() {
        return symlinkDone && regularDone;
      });
      return runs(function() {
        return expect(symlinkPaths).toEqual(paths);
      });
    });
    return it("ignores missing symlinks", function() {
      var directory, done, onDone, onPath, paths;
      if (process.platform === 'win32') {
        return;
      }
      directory = temp.mkdirSync('symlink-in-here');
      paths = [];
      onPath = function(childPath) {
        return paths.push(childPath);
      };
      fs.symlinkSync(path.join(directory, 'source'), path.join(directory, 'destination'));
      done = false;
      onDone = function() {
        return done = true;
      };
      fs.traverseTree(directory, onPath, onPath, onDone);
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        return expect(paths.length).toBe(0);
      });
    });
  });
  describe(".md5ForPath(path)", function() {
    return it("returns the MD5 hash of the file at the given path", function() {
      return expect(fs.md5ForPath(require.resolve('./fixtures/binary-file.png'))).toBe('cdaad7483b17865b5f00728d189e90eb');
    });
  });
  describe(".list(path, extensions)", function() {
    it("returns the absolute paths of entries within the given directory", function() {
      var paths;
      paths = fs.listSync(fixturesDir);
      expect(paths).toContain(path.join(fixturesDir, 'css.css'));
      expect(paths).toContain(path.join(fixturesDir, 'coffee.coffee'));
      expect(paths).toContain(path.join(fixturesDir, 'sample.txt'));
      expect(paths).toContain(path.join(fixturesDir, 'sample.js'));
      return expect(paths).toContain(path.join(fixturesDir, 'binary-file.png'));
    });
    it("returns an empty array for paths that aren't directories or don't exist", function() {
      expect(fs.listSync(path.join(fixturesDir, 'sample.js'))).toEqual([]);
      return expect(fs.listSync('/non/existent/directory')).toEqual([]);
    });
    it("can filter the paths by an optional array of file extensions", function() {
      var j, len, listedPath, paths, results;
      paths = fs.listSync(fixturesDir, ['.css', 'coffee']);
      expect(paths).toContain(path.join(fixturesDir, 'css.css'));
      expect(paths).toContain(path.join(fixturesDir, 'coffee.coffee'));
      results = [];
      for (j = 0, len = paths.length; j < len; j++) {
        listedPath = paths[j];
        results.push(expect(listedPath).toMatch(/(css|coffee)$/));
      }
      return results;
    });
    return it("returns alphabetically sorted paths (lowercase first)", function() {
      var paths, sortedPaths;
      paths = fs.listSync(fixturesDir);
      sortedPaths = [path.join(fixturesDir, 'binary-file.png'), path.join(fixturesDir, 'coffee.coffee'), path.join(fixturesDir, 'css.css'), path.join(fixturesDir, 'link-to-sample.js'), path.join(fixturesDir, 'sample.js'), path.join(fixturesDir, 'Sample.markdown'), path.join(fixturesDir, 'sample.txt'), path.join(fixturesDir, 'test.cson'), path.join(fixturesDir, 'test.json'), path.join(fixturesDir, 'Xample.md')];
      return expect(sortedPaths).toEqual(paths);
    });
  });
  describe(".list(path, [extensions,] callback)", function() {
    var paths;
    paths = null;
    it("calls the callback with the absolute paths of entries within the given directory", function() {
      var done;
      done = false;
      fs.list(fixturesDir, function(err, result) {
        paths = result;
        return done = true;
      });
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        expect(paths).toContain(path.join(fixturesDir, 'css.css'));
        expect(paths).toContain(path.join(fixturesDir, 'coffee.coffee'));
        expect(paths).toContain(path.join(fixturesDir, 'sample.txt'));
        expect(paths).toContain(path.join(fixturesDir, 'sample.js'));
        return expect(paths).toContain(path.join(fixturesDir, 'binary-file.png'));
      });
    });
    return it("can filter the paths by an optional array of file extensions", function() {
      var done;
      done = false;
      fs.list(fixturesDir, ['css', '.coffee'], function(err, result) {
        paths = result;
        return done = true;
      });
      waitsFor(function() {
        return done;
      });
      return runs(function() {
        var j, len, listedPath, results;
        expect(paths).toContain(path.join(fixturesDir, 'css.css'));
        expect(paths).toContain(path.join(fixturesDir, 'coffee.coffee'));
        results = [];
        for (j = 0, len = paths.length; j < len; j++) {
          listedPath = paths[j];
          results.push(expect(listedPath).toMatch(/(css|coffee)$/));
        }
        return results;
      });
    });
  });
  describe(".absolute(relativePath)", function() {
    return it("converts a leading ~ segment to the HOME directory", function() {
      var homeDir;
      homeDir = fs.getHomeDirectory();
      expect(fs.absolute('~')).toBe(fs.realpathSync(homeDir));
      expect(fs.absolute(path.join('~', 'does', 'not', 'exist'))).toBe(path.join(homeDir, 'does', 'not', 'exist'));
      return expect(fs.absolute('~test')).toBe('~test');
    });
  });
  describe(".getAppDataDirectory", function() {
    var originalAppData, originalHome, originalPlatform;
    originalPlatform = null;
    originalHome = null;
    originalAppData = null;
    beforeEach(function() {
      originalPlatform = process.platform;
      originalHome = process.env.HOME;
      return originalAppData = process.env.APPDATA;
    });
    afterEach(function() {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      });
      if (originalHome != null) {
        process.env.HOME = originalHome;
      } else {
        delete process.env.HOME;
      }
      if (originalAppData != null) {
        return process.env.APPDATA = originalAppData;
      } else {
        return delete process.env.APPDATA;
      }
    });
    it("returns the Application Support path on Mac", function() {
      Object.defineProperty(process, 'platform', {
        value: 'darwin'
      });
      if (!process.env.HOME) {
        process.env.HOME = path.join(path.sep, 'Users', 'Buzz');
      }
      return expect(fs.getAppDataDirectory()).toBe(path.join(fs.getHomeDirectory(), 'Library', 'Application Support'));
    });
    it("returns %AppData% on Windows", function() {
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
      if (!process.env.APPDATA) {
        process.env.APPDATA = 'C:\\Users\\test\\AppData\\Roaming';
      }
      return expect(fs.getAppDataDirectory()).toBe(process.env.APPDATA);
    });
    it("returns /var/lib on linux", function() {
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });
      return expect(fs.getAppDataDirectory()).toBe('/var/lib');
    });
    return it("returns null on other platforms", function() {
      Object.defineProperty(process, 'platform', {
        value: 'foobar'
      });
      return expect(fs.getAppDataDirectory()).toBe(null);
    });
  });
  describe(".getSizeSync(pathToCheck)", function() {
    return it("returns the size of the file at the path", function() {
      expect(fs.getSizeSync()).toBe(-1);
      expect(fs.getSizeSync('')).toBe(-1);
      expect(fs.getSizeSync(null)).toBe(-1);
      expect(fs.getSizeSync(path.join(fixturesDir, 'binary-file.png'))).toBe(392);
      return expect(fs.getSizeSync(path.join(fixturesDir, 'does.not.exist'))).toBe(-1);
    });
  });
  describe(".writeFileSync(filePath)", function() {
    return it("creates any missing parent directories", function() {
      var directory, file;
      directory = temp.mkdirSync('fs-plus-');
      file = path.join(directory, 'a', 'b', 'c.txt');
      expect(fs.existsSync(path.dirname(file))).toBeFalsy();
      fs.writeFileSync(file, 'contents');
      expect(fs.readFileSync(file, 'utf8')).toBe('contents');
      return expect(fs.existsSync(path.dirname(file))).toBeTruthy();
    });
  });
  describe(".writeFile(filePath)", function() {
    return it("creates any missing parent directories", function() {
      var directory, file, handler;
      directory = temp.mkdirSync('fs-plus-');
      file = path.join(directory, 'a', 'b', 'c.txt');
      expect(fs.existsSync(path.dirname(file))).toBeFalsy();
      handler = jasmine.createSpy('writeFileHandler');
      fs.writeFile(file, 'contents', handler);
      waitsFor(function() {
        return handler.calls.count() === 1;
      });
      return runs(function() {
        expect(fs.readFileSync(file, 'utf8')).toBe('contents');
        return expect(fs.existsSync(path.dirname(file))).toBeTruthy();
      });
    });
  });
  describe(".copySync(sourcePath, destinationPath)", function() {
    var destination, source;
    [source, destination] = [];
    beforeEach(function() {
      source = temp.mkdirSync('fs-plus-');
      return destination = temp.mkdirSync('fs-plus-');
    });
    describe("with just files", function() {
      beforeEach(function() {
        fs.writeFileSync(path.join(source, 'a.txt'), 'a');
        return fs.copySync(source, destination);
      });
      return it("copies the file", function() {
        return expect(fs.isFileSync(path.join(destination, 'a.txt'))).toBeTruthy();
      });
    });
    return describe("with folders and files", function() {
      beforeEach(function() {
        fs.writeFileSync(path.join(source, 'a.txt'), 'a');
        fs.makeTreeSync(path.join(source, 'b'));
        return fs.copySync(source, destination);
      });
      it("copies the file and folder", function() {
        expect(fs.isFileSync(path.join(destination, 'a.txt'))).toBeTruthy();
        return expect(fs.isDirectorySync(path.join(destination, 'b'))).toBeTruthy();
      });
      return describe("source is copied into itself", function() {
        beforeEach(function() {
          source = temp.mkdirSync('fs-plus-');
          destination = source;
          fs.writeFileSync(path.join(source, 'a.txt'), 'a');
          fs.makeTreeSync(path.join(source, 'b'));
          return fs.copySync(source, path.join(destination, path.basename(source)));
        });
        return it("copies the directory once", function() {
          expect(fs.isDirectorySync(path.join(destination, path.basename(source)))).toBeTruthy();
          expect(fs.isDirectorySync(path.join(destination, path.basename(source), 'b'))).toBeTruthy();
          return expect(fs.isDirectorySync(path.join(destination, path.basename(source), path.basename(source)))).toBeFalsy();
        });
      });
    });
  });
  describe(".copyFileSync(sourceFilePath, destinationFilePath)", function() {
    return it("copies the specified file", function() {
      var content, destinationFilePath, i, j, sourceFilePath;
      sourceFilePath = temp.path();
      destinationFilePath = path.join(temp.path(), '/unexisting-dir/foo.bar');
      content = '';
      for (i = j = 0; j < 20000; i = j += 1) {
        content += 'ABCDE';
      }
      fs.writeFileSync(sourceFilePath, content);
      fs.copyFileSync(sourceFilePath, destinationFilePath);
      return expect(fs.readFileSync(destinationFilePath, 'utf8')).toBe(fs.readFileSync(sourceFilePath, 'utf8'));
    });
  });
  describe(".isCaseSensitive()/isCaseInsensitive()", function() {
    return it("does not return the same value for both", function() {
      return expect(fs.isCaseInsensitive()).not.toBe(fs.isCaseSensitive());
    });
  });
  describe(".resolve(loadPaths, pathToResolve, extensions)", function() {
    return it("returns the resolved path or undefined if it does not exist", function() {
      expect(fs.resolve(fixturesDir, 'sample.js')).toBe(path.join(fixturesDir, 'sample.js'));
      expect(fs.resolve(fixturesDir, 'sample', ['js'])).toBe(path.join(fixturesDir, 'sample.js'));
      expect(fs.resolve(fixturesDir, 'sample', ['abc', 'txt'])).toBe(path.join(fixturesDir, 'sample.txt'));
      expect(fs.resolve(fixturesDir)).toBe(fixturesDir);
      expect(fs.resolve()).toBeUndefined();
      expect(fs.resolve(fixturesDir, 'sample', ['badext'])).toBeUndefined();
      expect(fs.resolve(fixturesDir, 'doesnotexist.js')).toBeUndefined();
      expect(fs.resolve(fixturesDir, void 0)).toBeUndefined();
      expect(fs.resolve(fixturesDir, 3)).toBeUndefined();
      expect(fs.resolve(fixturesDir, false)).toBeUndefined();
      expect(fs.resolve(fixturesDir, null)).toBeUndefined();
      return expect(fs.resolve(fixturesDir, '')).toBeUndefined();
    });
  });
  describe(".isAbsolute(pathToCheck)", function() {
    var originalPlatform;
    originalPlatform = null;
    beforeEach(function() {
      return originalPlatform = process.platform;
    });
    afterEach(function() {
      return Object.defineProperty(process, 'platform', {
        value: originalPlatform
      });
    });
    it("returns false when passed \\", function() {
      return expect(fs.isAbsolute('\\')).toBe(false);
    });
    return it("returns true when the path is absolute, false otherwise", function() {
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
      expect(fs.isAbsolute()).toBe(false);
      expect(fs.isAbsolute(null)).toBe(false);
      expect(fs.isAbsolute('')).toBe(false);
      expect(fs.isAbsolute('test')).toBe(false);
      expect(fs.isAbsolute('a\\b')).toBe(false);
      expect(fs.isAbsolute('/a/b/c')).toBe(false);
      expect(fs.isAbsolute('\\\\server\\share')).toBe(true);
      expect(fs.isAbsolute('C:\\Drive')).toBe(true);
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });
      expect(fs.isAbsolute()).toBe(false);
      expect(fs.isAbsolute(null)).toBe(false);
      expect(fs.isAbsolute('')).toBe(false);
      expect(fs.isAbsolute('test')).toBe(false);
      expect(fs.isAbsolute('a/b')).toBe(false);
      expect(fs.isAbsolute('\\\\server\\share')).toBe(false);
      expect(fs.isAbsolute('C:\\Drive')).toBe(false);
      expect(fs.isAbsolute('/')).toBe(true);
      return expect(fs.isAbsolute('/a/b/c')).toBe(true);
    });
  });
  describe(".normalize(pathToNormalize)", function() {
    return it("normalizes the path", function() {
      expect(fs.normalize()).toBe(null);
      expect(fs.normalize(null)).toBe(null);
      expect(fs.normalize(true)).toBe('true');
      expect(fs.normalize('')).toBe('.');
      expect(fs.normalize(3)).toBe('3');
      expect(fs.normalize('a')).toBe('a');
      expect(fs.normalize('a/b/c/../d')).toBe(path.join('a', 'b', 'd'));
      expect(fs.normalize('./a')).toBe('a');
      expect(fs.normalize('~')).toBe(fs.getHomeDirectory());
      return expect(fs.normalize('~/foo')).toBe(path.join(fs.getHomeDirectory(), 'foo'));
    });
  });
  describe(".tildify(pathToTildify)", function() {
    var getHomeDirectory;
    getHomeDirectory = null;
    beforeEach(function() {
      return getHomeDirectory = fs.getHomeDirectory;
    });
    afterEach(function() {
      return fs.getHomeDirectory = getHomeDirectory;
    });
    it("tildifys the path on Linux and macOS", function() {
      var fixture, home;
      if (process.platform === 'win32') {
        return;
      }
      home = fs.getHomeDirectory();
      expect(fs.tildify(home)).toBe('~');
      expect(fs.tildify(path.join(home, 'foo'))).toBe('~/foo');
      fixture = path.join('foo', home);
      expect(fs.tildify(fixture)).toBe(fixture);
      fixture = path.resolve(`${home}foo`, 'tildify');
      expect(fs.tildify(fixture)).toBe(fixture);
      return expect(fs.tildify('foo')).toBe('foo');
    });
    it("does not tildify if home is unset", function() {
      var fixture, home;
      if (process.platform === 'win32') {
        return;
      }
      home = fs.getHomeDirectory();
      fs.getHomeDirectory = function() {
        return void 0;
      };
      fixture = path.join(home, 'foo');
      return expect(fs.tildify(fixture)).toBe(fixture);
    });
    return it("doesn't change URLs or paths not tildified", function() {
      var pathToLeaveAlone, urlToLeaveAlone;
      urlToLeaveAlone = "https://atom.io/something/fun?abc";
      expect(fs.tildify(urlToLeaveAlone)).toBe(urlToLeaveAlone);
      pathToLeaveAlone = "/Library/Support/Atom/State";
      return expect(fs.tildify(pathToLeaveAlone)).toBe(pathToLeaveAlone);
    });
  });
  describe(".move", function() {
    var tempDir;
    tempDir = null;
    beforeEach(function() {
      return tempDir = temp.mkdirSync('fs-plus-');
    });
    it('calls back with an error if the source does not exist', function() {
      var callback, directoryPath, newDirectoryPath;
      callback = jasmine.createSpy('callback');
      directoryPath = path.join(tempDir, 'subdir');
      newDirectoryPath = path.join(tempDir, 'subdir2', 'subdir2');
      fs.move(directoryPath, newDirectoryPath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        expect(callback.calls.allArgs()[0][0]).toBeTruthy();
        return expect(callback.calls.allArgs()[0][0].code).toBe('ENOENT');
      });
    });
    it('calls back with an error if the target already exists', function() {
      var callback, directoryPath, newDirectoryPath;
      callback = jasmine.createSpy('callback');
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'subdir2');
      fs.mkdirSync(newDirectoryPath);
      fs.move(directoryPath, newDirectoryPath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        expect(callback.calls.allArgs()[0][0]).toBeTruthy();
        return expect(callback.calls.allArgs()[0][0].code).toBe('EEXIST');
      });
    });
    it('renames if the target just has different letter casing', function() {
      var callback, directoryPath, newDirectoryPath;
      callback = jasmine.createSpy('callback');
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'SUBDIR');
      fs.move(directoryPath, newDirectoryPath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        // If the filesystem is case-insensitive, the old directory should still exist.
        expect(fs.existsSync(directoryPath)).toBe(fs.isCaseInsensitive());
        return expect(fs.existsSync(newDirectoryPath)).toBe(true);
      });
    });
    it('renames to a target with an existent parent directory', function() {
      var callback, directoryPath, newDirectoryPath;
      callback = jasmine.createSpy('callback');
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'subdir2');
      fs.move(directoryPath, newDirectoryPath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        expect(fs.existsSync(directoryPath)).toBe(false);
        return expect(fs.existsSync(newDirectoryPath)).toBe(true);
      });
    });
    it('renames to a target with a non-existent parent directory', function() {
      var callback, directoryPath, newDirectoryPath;
      callback = jasmine.createSpy('callback');
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'subdir2/subdir2');
      fs.move(directoryPath, newDirectoryPath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        expect(fs.existsSync(directoryPath)).toBe(false);
        return expect(fs.existsSync(newDirectoryPath)).toBe(true);
      });
    });
    return it('renames files', function() {
      var callback, filePath, newFilePath;
      callback = jasmine.createSpy('callback');
      filePath = path.join(tempDir, 'subdir');
      fs.writeFileSync(filePath, '');
      newFilePath = path.join(tempDir, 'subdir2');
      fs.move(filePath, newFilePath, callback);
      waitsFor(function() {
        return callback.calls.count() === 1;
      });
      return runs(function() {
        expect(fs.existsSync(filePath)).toBe(false);
        return expect(fs.existsSync(newFilePath)).toBe(true);
      });
    });
  });
  describe(".moveSync", function() {
    var tempDir;
    tempDir = null;
    beforeEach(function() {
      return tempDir = temp.mkdirSync('fs-plus-');
    });
    it('throws an error if the source does not exist', function() {
      var directoryPath, newDirectoryPath;
      directoryPath = path.join(tempDir, 'subdir');
      newDirectoryPath = path.join(tempDir, 'subdir2', 'subdir2');
      return expect(function() {
        return fs.moveSync(directoryPath, newDirectoryPath);
      }).toThrow();
    });
    it('throws an error if the target already exists', function() {
      var directoryPath, newDirectoryPath;
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'subdir2');
      fs.mkdirSync(newDirectoryPath);
      return expect(function() {
        return fs.moveSync(directoryPath, newDirectoryPath);
      }).toThrow();
    });
    it('renames if the target just has different letter casing', function() {
      var directoryPath, newDirectoryPath;
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'SUBDIR');
      fs.moveSync(directoryPath, newDirectoryPath);
      // If the filesystem is case-insensitive, the old directory should still exist.
      expect(fs.existsSync(directoryPath)).toBe(fs.isCaseInsensitive());
      return expect(fs.existsSync(newDirectoryPath)).toBe(true);
    });
    it('renames to a target with an existent parent directory', function() {
      var directoryPath, newDirectoryPath;
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'subdir2');
      fs.moveSync(directoryPath, newDirectoryPath);
      expect(fs.existsSync(directoryPath)).toBe(false);
      return expect(fs.existsSync(newDirectoryPath)).toBe(true);
    });
    it('renames to a target with a non-existent parent directory', function() {
      var directoryPath, newDirectoryPath;
      directoryPath = path.join(tempDir, 'subdir');
      fs.mkdirSync(directoryPath);
      newDirectoryPath = path.join(tempDir, 'subdir2/subdir2');
      fs.moveSync(directoryPath, newDirectoryPath);
      expect(fs.existsSync(directoryPath)).toBe(false);
      return expect(fs.existsSync(newDirectoryPath)).toBe(true);
    });
    return it('renames files', function() {
      var filePath, newFilePath;
      filePath = path.join(tempDir, 'subdir');
      fs.writeFileSync(filePath, '');
      newFilePath = path.join(tempDir, 'subdir2');
      fs.moveSync(filePath, newFilePath);
      expect(fs.existsSync(filePath)).toBe(false);
      return expect(fs.existsSync(newFilePath)).toBe(true);
    });
  });
  describe('.isBinaryExtension', function() {
    it('returns true for a recognized binary file extension', function() {
      return expect(fs.isBinaryExtension('.DS_Store')).toBe(true);
    });
    it('returns false for non-binary file extension', function() {
      return expect(fs.isBinaryExtension('.bz2')).toBe(false);
    });
    return it('returns true for an uppercase binary file extension', function() {
      return expect(fs.isBinaryExtension('.EXE')).toBe(true);
    });
  });
  describe(".isCompressedExtension", function() {
    it('returns true for a recognized compressed file extension', function() {
      return expect(fs.isCompressedExtension('.bz2')).toBe(true);
    });
    return it('returns false for non-compressed file extension', function() {
      return expect(fs.isCompressedExtension('.jpg')).toBe(false);
    });
  });
  describe('.isImageExtension', function() {
    it('returns true for a recognized image file extension', function() {
      return expect(fs.isImageExtension('.jpg')).toBe(true);
    });
    return it('returns false for non-image file extension', function() {
      return expect(fs.isImageExtension('.bz2')).toBe(false);
    });
  });
  describe('.isMarkdownExtension', function() {
    it('returns true for a recognized Markdown file extension', function() {
      return expect(fs.isMarkdownExtension('.md')).toBe(true);
    });
    it('returns false for non-Markdown file extension', function() {
      return expect(fs.isMarkdownExtension('.bz2')).toBe(false);
    });
    return it('returns true for a recognised Markdown file extension with unusual capitalisation', function() {
      return expect(fs.isMarkdownExtension('.MaRKdOwN')).toBe(true);
    });
  });
  describe('.isPdfExtension', function() {
    it('returns true for a recognized PDF file extension', function() {
      return expect(fs.isPdfExtension('.pdf')).toBe(true);
    });
    it('returns false for non-PDF file extension', function() {
      return expect(fs.isPdfExtension('.bz2')).toBe(false);
    });
    return it('returns true for an uppercase PDF file extension', function() {
      return expect(fs.isPdfExtension('.PDF')).toBe(true);
    });
  });
  return describe('.isReadmePath', function() {
    it('returns true for a recognized README path', function() {
      return expect(fs.isReadmePath('./path/to/README.md')).toBe(true);
    });
    return it('returns false for non README path', function() {
      return expect(fs.isReadmePath('./path/foo.txt')).toBe(false);
    });
  });
});
