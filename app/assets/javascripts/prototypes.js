String.prototype.idealize = function() {
  return this.replace(/\s/g, '\\ ')
             .replace("'", "\\'")
             .replace('!', '\\!')
             .replace('/', '\\/')
             .replace(':', '\\:');
}