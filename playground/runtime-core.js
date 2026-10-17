/* Runs only in an isolated worker. No DOM, network or host filesystem bridge. */
globalThis.runTurtle = async function(source, turtleModule) {
  if (typeof source !== 'string' || source.length > 65536) throw new Error('Script exceeds 64 KB.');
  const commands = [];
  let output = '', vertices = 0;
  Sk.configure({
    __future__:Sk.python3,
    execLimit:4000,
    yieldLimit:50,
    output: text => { output = (output + text).slice(0,4000); },
    read: path => {
      if (['src/builtin/sys.py','src/lib/sys.py','sys.py'].includes(path)) return 'class _Output:\n    def write(self, text):\n        _mm_output(text)\n    def flush(self):\n        pass\nstdout = _Output()\nstderr = stdout\n';
      if (path === 'src/lib/turtle.py' || path === 'turtle.py') return turtleModule;
      // Deliberately omit browser/DOM/file/network modules, including the upstream turtle.
      if (/^src\/lib\/(math|random)\.js$/.test(path) && Object.hasOwn(Sk.builtinFiles.files,path)) return Sk.builtinFiles.files[path];
      throw new Sk.builtin.ImportError('Only turtle, math and random are available in this playground.');
    },
    inputfun: () => { throw new Sk.builtin.RuntimeError('input() is not available. Put values in your code.'); },
    fileopen: () => { throw new Sk.builtin.RuntimeError('File access is disabled.'); },
    filewrite: () => { throw new Sk.builtin.RuntimeError('File access is disabled.'); }
  });
  Sk.builtins._mm_output = new Sk.builtin.func(function(value) { output = (output + String(Sk.ffi.remapToJs(value))).slice(0,4000); return Sk.builtin.none.none$; });
  Sk.builtins.__mm_emit = new Sk.builtin.func(function(value) {
    if (commands.length >= 12000) throw new Sk.builtin.RuntimeError('Drawing limit reached (12,000 commands).');
    const command = Sk.ffi.remapToJs(value);
    vertices += Array.isArray(command?.points) ? command.points.length : 1;
    if (vertices > 50000) throw new Sk.builtin.RuntimeError('Drawing limit reached (50,000 points).');
    commands.push(command);
    return Sk.builtin.none.none$;
  });
  await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<playground>',false,source,true));
  return {commands,output};
};
