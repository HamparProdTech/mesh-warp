export default class GridManager {
  init(width, height, rows, columns) {
    if (!this.build) {
      this.build = true
      this.width = width
      this.height = height
      this.rows = rows
      this.columns = columns

      const colWidth = width / columns
      const rowHeight = height / rows

      // given 1x1, should return 2x2, 4 total, 0-3
      // given 3x2, should return 4x3, 12 total, 0-11
      columns++
      rows++

      const total = rows * columns
      this.positions = []
      this.rootPositions = []

      for (let i = 0; i < total; i++) {
        const data = {
          x: (i % columns) * colWidth,
          y: Math.floor(i / columns) * rowHeight,
        }
        this.positions.push(data)

        this.rootPositions.push({ ...data })
      }

      this.grids = []

      for (let i = 0; i < this.positions.length - columns; i++)
        this.grids.push({
          t1: [0, 1, columns],
          t2: [1, columns, 1 + columns],
        })
    }
  }

  updateDot(index, x, y) {
    this.positions[index] = {
      x,
      y,
    }
  }
}
