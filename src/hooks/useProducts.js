import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchProductDetails,
  setFilters,
  clearFilters,
  selectProducts,
  selectProductsLoading,
  selectProductsError,
  selectFilters,
  selectPagination,
} from "../store/slices/productsSlice";

export const useProducts = () => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: pagination.pageSize || 20, ...filters }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  const loadMoreProducts = useCallback(() => {
    if (!loading && pagination.currentPage + 1 < pagination.totalPages) {
      dispatch(fetchProducts({ page: pagination.currentPage + 1, size: pagination.pageSize, ...filters }));
    }
  }, [dispatch, loading, pagination, filters]);

  const refreshProducts = useCallback(() => {
    dispatch(fetchProducts({ page: 0, size: 20, sort: "createdAt,desc" }));
  }, [dispatch]);

  return {
    products,
    loading,
    error,
    filters,
    pagination,
    hasMoreProducts: pagination.currentPage + 1 < pagination.totalPages,
    loadMoreProducts,
    refreshProducts,
    filterProducts: (next) => dispatch(setFilters(next)),
    resetFilters: () => dispatch(clearFilters()),
    loadProductDetails: (id) => dispatch(fetchProductDetails(id)),
  };
};

export default useProducts;
