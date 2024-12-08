export const getAuthToken = (): string => {
  return localStorage.getItem('token') || '';
}; 