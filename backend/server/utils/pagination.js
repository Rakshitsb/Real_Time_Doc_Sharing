const getPagination = ({ page = 1, limit = 20, maxLimit = 50 }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), maxLimit);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};

const buildPaginatedResult = ({ data, total, page, limit }) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});

export { buildPaginatedResult, getPagination };
