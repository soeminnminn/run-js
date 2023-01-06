
const executer = {
  run(code, console) {
    return new Promise((resolve, reject) => {
      try {
        const fn = new Function('console', code);
        const result = fn(console);
        resolve(result);
      } catch(e) {
        reject(e);
      }
    });
  }
};

export default executer;