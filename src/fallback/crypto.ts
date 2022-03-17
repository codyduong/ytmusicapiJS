//A reimplemntation of createHash from Node crypto module.
//crypto-browserify does not work for webpack 5
import CryptoJS from 'crypto-js';

class Hash {
  #value: ReturnType<typeof CryptoJS.algo.SHA1.create>;
  constructor() {
    this.#value = CryptoJS.algo.SHA1.create();
  }
  setValue(value: any): void {
    this.#value = value;
  }
  update(string: string): void {
    this.#value.update(string);
  }
  //Intentionally unused param
  digest(_string: string): CryptoJS.lib.WordArray {
    return this.#value.finalize();
  }
}

//Intentionally unused param
export const createHash = (_string: string): any => {
  return new Hash();
};
