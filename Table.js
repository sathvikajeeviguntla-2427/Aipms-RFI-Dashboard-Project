import React, { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Stack,
  Paper,
  Typography,
  Pagination,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventIcon from '@mui/icons-material/Event';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { useCsvParser } from '../../dataLoader';
import './Table.css';

const DEFAULT_COLUMNS = ['package', 'station', 'result', 'date'];

const getValue = (row, col) => {
  if (!row) return '';
  const found = Object.keys(row).find((k) => k.toLowerCase() === col.toLowerCase());
  return found ? row[found] : '';
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const CustomNoRowsOverlay = () => (
  <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', p: 4 }}>
    <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
      No data available
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Upload a CSV or adjust filters to see results.
    </Typography>
  </Stack>
);

const Table = ({ data = [] }) => {
  const { data: csvData, handleFileChange } = useCsvParser();

  const [filters, setFilters] = useState({ package: '', station: '', result: '', dateFrom: null, dateTo: null });
  const [globalSearch, setGlobalSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const source = data && data.length ? data : csvData;

  const columns = useMemo(() => (source && source.length ? Object.keys(source[0]) : DEFAULT_COLUMNS), [source]);

  // Prepare DataGrid columns
  const gridColumns = useMemo(
    () =>
      columns.map((col) => ({
        field: col,
        headerName: capitalize(col),
        flex: 1,
        minWidth: 120,
        sortable: true,
      })),
    [columns]
  );

  // Map source rows to consistent objects with id
  const rows = useMemo(() => {
    if (!source || !source.length) return [];
    return source.map((r, i) => ({ id: r.id ?? i, ...r }));
  }, [source]);

  // Filtering logic
  const filteredRows = useMemo(() => {
    if (!rows || !rows.length) return [];

    return rows.filter((row) => {
      const pkg = String(getValue(row, 'package') ?? '').toLowerCase();
      const station = String(getValue(row, 'station') ?? '').toLowerCase();
      const result = String(getValue(row, 'result') ?? '').toLowerCase();
      const dateVal = String(getValue(row, 'date') ?? '');

      if (filters.package && !pkg.includes(filters.package.toLowerCase())) return false;
      if (filters.station && !station.includes(filters.station.toLowerCase())) return false;
      if (filters.result && !result.includes(filters.result.toLowerCase())) return false;

      if (filters.dateFrom) {
        const from = Date.parse(filters.dateFrom);
        const d = Date.parse(dateVal);
        if (isNaN(d) || isNaN(from) || d < from) return false;
      }
      if (filters.dateTo) {
        const to = Date.parse(filters.dateTo);
        const d = Date.parse(dateVal);
        if (isNaN(d) || isNaN(to) || d > to) return false;
      }

      // Global search across all visible columns
      if (globalSearch) {
        const q = globalSearch.toLowerCase();
        const found = Object.keys(row).some((k) => String(row[k] ?? '').toLowerCase().includes(q));
        if (!found) return false;
      }

      return true;
    });
  }, [rows, filters, globalSearch]);

  // Pagination slice
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, background: 'background.paper' }}>
      <Stack spacing={2}>
        {/* Top toolbar: Upload, Global search, Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadFileIcon />}
              sx={{
                background: 'linear-gradient(90deg,#4f46e5,#06b6d4)',
                color: 'common.white',
                textTransform: 'none',
                py: 1,
                px: 1.5,
                '&:hover': { filter: 'brightness(0.95)' },
                '&:active': { transform: 'translateY(1px)' },
                borderRadius: 2,
                boxShadow: '0 6px 18px rgba(34,197,94,0.08)',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              Upload CSV
              <input hidden accept=".csv,text/csv" type="file" onChange={handleFileChange} />
            </Button>
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search all columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Package"
                value={filters.package}
                onChange={(e) => setFilters((f) => ({ ...f, package: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 120 }}
              />

              <TextField
                size="small"
                placeholder="Station"
                value={filters.station}
                onChange={(e) => setFilters((f) => ({ ...f, station: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 120 }}
              />

              <TextField
                size="small"
                placeholder="Result"
                value={filters.result}
                onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 120 }}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={filters.dateFrom}
                  onChange={(val) => setFilters((f) => ({ ...f, dateFrom: val }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{ minWidth: 140 }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  label="From"
                />

                <DatePicker
                  value={filters.dateTo}
                  onChange={(val) => setFilters((f) => ({ ...f, dateTo: val }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{ minWidth: 140 }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  label="To"
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
        </Grid>

        {/* Table area */}
        <Box sx={{ width: '100%', height: { xs: 420, md: 520 }, mt: 1 }}>
          <DataGrid
            rows={pagedRows}
            columns={gridColumns}
            pageSize={pageSize}
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            hideFooter
            components={{ NoRowsOverlay: CustomNoRowsOverlay }}
            sx={{
              borderRadius: 2,
              boxShadow: 1,
              '& .MuiDataGrid-columnHeaders': {
                background: 'rgba(15,23,42,0.04)',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              },
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                bgcolor: 'action.hover',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: 'action.selected',
              },
              '& .MuiDataGrid-cell': {
                py: 1.2,
                px: 1.5,
              },
            }}
          />
        </Box>

        {/* Footer: pagination and record count */}
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredRows.length} records
            </Typography>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                select={false}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                size="small"
                sx={{ width: 100 }}
                SelectProps={{ native: true }}
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </TextField>

              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                siblingCount={1}
                boundaryCount={1}
              />
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default Table;
