const Table = ({ columns, data, onRowClick, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-8 text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row._id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-dark-border ${
                  onRowClick ? 'cursor-pointer hover:bg-dark-hover' : ''
                } transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-4 text-gray-300">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
