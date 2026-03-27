import { useState, useMemo, Fragment } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import clsx from 'clsx';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  onRowClick,
  emptyMessage = 'No data available',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  expandable = false,
  renderExpanded,
  rowKey = 'id',
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleSort = (col) => {
    if (!col.sortable) return;
    const accessor = typeof col.accessor === 'string' ? col.accessor : col.key;
    if (sortField === accessor) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(accessor);
      setSortDir('desc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const getVal = (row) => {
        const col = columns.find((c) => (typeof c.accessor === 'string' ? c.accessor : c.key) === sortField);
        if (typeof col?.accessor === 'function') return col.accessor(row);
        return row[sortField];
      };
      const va = getVal(a);
      const vb = getVal(b);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [data, sortField, sortDir, columns]);

  const toggleExpand = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((r) => r[rowKey]));
    }
  };

  const toggleSelect = (id) => {
    if (!onSelectionChange) return;
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((r) => r !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-zinc-700/50">
        <table className="table-dense w-full">
          <thead>
            <tr className="border-b border-zinc-700/50 bg-zinc-800/50">
              {columns.map((col, i) => (
                <th key={i} className="text-left">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-zinc-700/30">
                {columns.map((_, j) => (
                  <td key={j}>
                    <div className="h-3.5 w-16 animate-pulse rounded bg-zinc-700" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 py-12">
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-700/50">
      <table className="table-dense w-full">
        <thead>
          <tr className="border-b border-zinc-700/50 bg-zinc-800/60">
            {selectable && (
              <th className="w-8 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-600"
                />
              </th>
            )}
            {expandable && <th className="w-8" />}
            {columns.map((col, i) => {
              const accessor = typeof col.accessor === 'string' ? col.accessor : col.key;
              const isActive = sortField === accessor;
              return (
                <th
                  key={i}
                  className={clsx('text-left', col.sortable && 'cursor-pointer select-none hover:text-zinc-200')}
                  onClick={() => handleSort(col)}
                  style={col.width ? { width: col.width } : undefined}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="flex-shrink-0">
                        {isActive ? (
                          sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        ) : (
                          <ChevronsUpDown size={10} className="opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const id = row[rowKey];
            const isExpanded = expandedRows.has(id);
            return (
              <Fragment key={id}>
                <tr
                  className={clsx(
                    'border-b border-zinc-700/30 transition-colors',
                    onRowClick && 'cursor-pointer',
                    selectedRows.includes(id) ? 'bg-primary-500/10' : 'hover:bg-zinc-800/50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(id)}
                        onChange={() => toggleSelect(id)}
                        className="rounded border-zinc-600"
                      />
                    </td>
                  )}
                  {expandable && (
                    <td
                      className="text-center cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(id); }}
                    >
                      <ChevronDown
                        size={14}
                        className={clsx('text-zinc-500 transition-transform', isExpanded && 'rotate-180')}
                      />
                    </td>
                  )}
                  {columns.map((col, j) => {
                    const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor || col.key];
                    const formatted = col.format ? col.format(val, row) : val;
                    return (
                      <td key={j} className={clsx('text-zinc-300', col.align === 'right' && 'text-right', col.className)}>
                        {col.render ? col.render(val, row) : formatted}
                      </td>
                    );
                  })}
                </tr>
                {expandable && isExpanded && renderExpanded && (
                  <tr className="bg-zinc-900/50">
                    <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="p-0">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
