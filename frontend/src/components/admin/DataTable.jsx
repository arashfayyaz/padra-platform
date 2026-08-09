import React, { useState, useMemo } from 'react';

/**
 * جدول قابل استفاده مجدد با جست‌وجو، مرتب‌سازی ستون‌ها و صفحه‌بندی سمت کلاینت.
 *
 * props:
 * - columns: [{ key, label, sortable, render(row) }]
 * - rows: آرایه‌ی داده
 * - searchKeys: کلیدهایی که جست‌وجو روی آن‌ها انجام می‌شود
 * - searchPlaceholder
 * - pageSize
 * - emptyText
 */
export default function DataTable({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = 'جست‌وجو...',
  pageSize = 8,
  emptyText = 'موردی یافت نشد',
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim() || searchKeys.length === 0) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter(row =>
      searchKeys.some(key => String(row[key] ?? '').toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return av - bv;
      return String(av).localeCompare(String(bv), 'fa');
    });
    if (sortDir === 'desc') copy.reverse();
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleQueryChange = (v) => {
    setQuery(v);
    setPage(1);
  };

  return (
    <div className="datatable-wrap">
      {searchKeys.length > 0 && (
        <div className="datatable-toolbar">
          <div className="datatable-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
            />
          </div>
          <span className="datatable-count">{sorted.length.toLocaleString('fa-IR')} مورد</span>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover mb-0 admin-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable-th' : ''}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && (
                    <i className={`bi ms-1 ${
                      sortKey === col.key
                        ? (sortDir === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up')
                        : 'bi-arrow-down-up text-muted opacity-50'
                    }`}></i>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                  {emptyText}
                </td>
              </tr>
            )}
            {pageRows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="datatable-pagination">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          <span className="datatable-page-info">
            صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        </div>
      )}
    </div>
  );
}
