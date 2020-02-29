export class Snake {
  _body: number[][];
  constructor(body: number[][] = []) {
    this._body = body;
  }

  get length() {
    return this._body.length;
  }

  get body() {
    return this._body;
  }

  set body(body) {
    this._body = body;
  }
}
