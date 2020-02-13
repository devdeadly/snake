export class Apple {
  _location: number[];
  _color: string;
  constructor(color = 'red', location = []) {
    this._color = color;
    this._location = location;
  }

  get color() {
    return this._color;
  }

  set color(col) {
    this.color = col;
  }

  get location() {
    return this._location;
  }

  set location(loc) {
    this._location = loc;
  }
}
