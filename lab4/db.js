const EventEmitter = require('events');

class DB extends EventEmitter {
  constructor() {
    super();
    this._rows = [
      { id: 1, name: 'Иван Иванов', bday: '1990-01-15' },
      { id: 2, name: 'Мария Петрова', bday: '1988-06-30' }
    ];
    this._nextId = 3;

    this.on('GET', async (payload) => {
      payload.cb(null, this.select());
    });

    this.on('POST', async (payload) => {
      try {
        const inserted = this.insert(payload.row);
        payload.cb(null, inserted);
      } catch (err) {
        payload.cb(err);
      }
    });

    this.on('PUT', async (payload) => {
      try {
        const updated = this.update(payload.row);
        payload.cb(null, updated);
      } catch (err) {
        payload.cb(err);
      }
    });

    this.on('DELETE', async (payload) => {
      try {
        const deleted = this.delete(payload.id);
        payload.cb(null, deleted);
      } catch (err) {
        payload.cb(err);
      }
    });
  }

  _asyncEmit(eventName, payload) {
    return new Promise((resolve, reject) => {
      const wrapper = Object.assign({}, payload);
      wrapper.cb = (err, result) => {
        if (err) reject(err);
        else resolve(result);
      };
      this.emit(eventName, wrapper);
    });
  }

  async selectAsync() {
    return this._asyncEmit('GET', {});
  }
  async insertAsync(row) {
    return this._asyncEmit('POST', { row });
  }
  async updateAsync(row) {
    return this._asyncEmit('PUT', { row });
  }
  async deleteAsync(id) {
    return this._asyncEmit('DELETE', { id });
  }

  select() {
    return this._rows.map(r => Object.assign({}, r));
  }

  insert(row) {
    if (!row || typeof row !== 'object') throw new Error('Invalid row');
    const newRow = {
      id: this._nextId++,
      name: String(row.name || ''),
      bday: String(row.bday || '')
    };
    this._rows.push(newRow);
    return Object.assign({}, newRow);
  }

  update(row) {
    if (!row || typeof row !== 'object' || typeof row.id !== 'number') {
      throw new Error('Invalid row or missing id');
    }
    const idx = this._rows.findIndex(r => r.id === row.id);
    if (idx === -1) throw new Error('Row not found');
    if ('name' in row) this._rows[idx].name = String(row.name);
    if ('bday' in row) this._rows[idx].bday = String(row.bday);
    return Object.assign({}, this._rows[idx]);
  }

  delete(id) {
    if (typeof id === 'string') id = Number(id);
    if (!Number.isFinite(id)) throw new Error('Invalid id');
    const idx = this._rows.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Row not found');
    const removed = this._rows.splice(idx, 1)[0];
    return Object.assign({}, removed);
  }
}

module.exports = DB;
