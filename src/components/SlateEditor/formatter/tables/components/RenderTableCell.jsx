import React from 'react'

export function RenderTableCell(props) {
  const { attributes, children, element } = props
  const { colSpan = 1, rowSpan = 1 } = element
  return (
    <td
      {...attributes}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className="yt-e-table-cell"
    >
      {children}
    </td>
  )
}
