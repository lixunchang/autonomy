/**
 * todo: 插入后光标位置
 */
import { Editor, Path, Transforms } from 'slate'
import {
  getCellBySelectOrFocus,
  getEmptyCellNode,
  getRangeByOrigin,
  getRealPathByPath,
  getRowNode,
  getTableByCellPath,
} from '../../../utils/util'

/**
 * 获取原始数据列数
 * 注：表格第一行肯定是所有列数据都有的
 * @param tableNode
 * @returns
 */
function getColNumber(tableNode) {
  const rowNode = tableNode.children[0]
  let colNum = 0
  rowNode.children.forEach((cellNode) => {
    const { colSpan = 1 } = cellNode
    colNum += colSpan
  })
  return colNum
}

/**
 * 获取原始数据 行数
 * @param tableNode
 * @returns
 */
function getRowNumber(originTable) {
  const lastRowOriginCell = originTable[originTable.length - 1][0]
  const rowIndex = (Array.isArray(lastRowOriginCell[0]) && Array.isArray(lastRowOriginCell[1])
    ? lastRowOriginCell[1][0]
    : lastRowOriginCell[0])
  return rowIndex + 1
}

/**
 * 插入行
 * @param editor
 * @param cellPaths
 */
function insertRow(editor, cellPaths, direction) {
  const newCell = getCellBySelectOrFocus(editor, cellPaths)

  if (!newCell[0]) return

  // 获取源表格数据
  const [originTable, tablePath, tableNode] = getTableByCellPath(
    editor,
    newCell[0],
  )
  const colNum = getColNumber(tableNode)
  const rowNum = getRowNumber(originTable)
  const targetIndex = direction === 'above' ? 0 : newCell.length - 1
  const targetCell = Path.relative(newCell[targetIndex], tablePath)

  const targetOriginCell = originTable[targetCell[0]][targetCell[1]]
  const addConstant = direction === 'above' ? -1 : 1
  const insertOriginRowIndex =
    (Array.isArray(targetOriginCell[0]) && Array.isArray(targetOriginCell[1])
      ? direction === 'above'
        ? targetOriginCell[0][0]
        : targetOriginCell[1][0]
      : targetOriginCell[0]) + addConstant
  const updateCellPaths = []
  const insertCells = []

  let insertRowIndex

  if (direction === 'above' && insertOriginRowIndex === -1) {
    // 在首行上方插入一行
    const insertRows = getRowNode(
      Array.from({ length: colNum }).map(() => getEmptyCellNode()),
    )
    Transforms.insertNodes(editor, insertRows, {
      at: [...tablePath, 0],
    })
    insertRowIndex = 0
  } else if (direction === 'below' && insertOriginRowIndex === rowNum) {
    // 在尾行下方插入一行
    const insertRows = getRowNode(
      Array.from({ length: colNum }).map(() => getEmptyCellNode()),
    )
    Transforms.insertNodes(editor, insertRows, {
      at: [...tablePath, tableNode.children.length],
    })
    insertRowIndex = tableNode.children.length
  } else {
    // 非首行上方/尾行下方插入
    Array.from({ length: colNum }).forEach((_, index) => {
      const curCell = getRealPathByPath(originTable, [
        insertOriginRowIndex,
        index,
      ])
      const curOriginCell = getRangeByOrigin(originTable, [
        insertOriginRowIndex,
        index,
      ])
      const edgeRowIndex =
        direction === 'above' ? curOriginCell[1][0] : curOriginCell[0][0]

      if (
        !Array.isArray(curOriginCell[0]) ||
        edgeRowIndex === insertOriginRowIndex
      ) {
        // 当前单元格非合并单元格 或者 当前单元格为合并单元格底部(上方插入)/顶部(下方插入)
        insertCells.push(getEmptyCellNode())
      } else if (
        !updateCellPaths.some((cellPath) => Path.equals(curCell, cellPath))
      ) {
        // 需要修改的合并单元格
        const [cellNode] = Editor.node(editor, [...tablePath, ...curCell])
        const { rowSpan = 1 } = cellNode
        Transforms.setNodes(
          editor,
          {
            rowSpan: rowSpan + 1,
          },
          {
            at: [...tablePath, ...curCell],
          },
        )
        updateCellPaths.push(curCell)
      }
    })

    const nextRowCell = getRealPathByPath(originTable, [
      insertOriginRowIndex,
      targetCell[1],
    ])
    const insertPath = [
      ...tablePath,
      direction === 'above' ? targetCell[0] : nextRowCell[0],
    ]

    Transforms.insertNodes(editor, getRowNode(insertCells), {
      at: insertPath,
    })

    insertRowIndex = direction === 'above' ? targetCell[0] : nextRowCell[0]
  }
  // 焦点聚焦
  const focusPath = [...tablePath, insertRowIndex, 0]
  Transforms.select(editor, {
    anchor: Editor.end(editor, focusPath),
    focus: Editor.end(editor, focusPath),
  })
}

const insertRowAbove = (editor, cellPaths) => {
  insertRow(editor, cellPaths, 'above')
}
const insertRowBelow = (editor, cellPaths) => {
  insertRow(editor, cellPaths, 'below')
}

export { insertRowAbove, insertRowBelow }
